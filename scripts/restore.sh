#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Please provide a backup file path${NC}"
    echo -e "Usage: $0 <backup-file.tar.gz>"
    exit 1
fi

BACKUP_FILE="$1"
TEMP_DIR="restore_temp"

echo -e "${YELLOW}Starting restore process...${NC}"

# Extract backup
echo -e "${YELLOW}Extracting backup...${NC}"
mkdir -p "$TEMP_DIR"
tar xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find the backup directory
BACKUP_DIR=$(ls "$TEMP_DIR")
FULL_BACKUP_DIR="$TEMP_DIR/$BACKUP_DIR"

# Verify backup contents
if [ ! -f "$FULL_BACKUP_DIR/metadata.json" ] || \
   [ ! -f "$FULL_BACKUP_DIR/database.sql" ] || \
   [ ! -f "$FULL_BACKUP_DIR/uploads.tar.gz" ]; then
    echo -e "${RED}Invalid backup file structure${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Stop services
echo -e "${YELLOW}Stopping services...${NC}"
docker-compose -f docker-compose.prod.yml down

# Start database
echo -e "${YELLOW}Starting database...${NC}"
docker-compose -f docker-compose.prod.yml up -d db

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
until docker-compose -f docker-compose.prod.yml exec db mysqladmin ping -h localhost --silent; do
    echo -n "."
    sleep 1
done

# Restore database
echo -e "${YELLOW}Restoring database...${NC}"
docker-compose -f docker-compose.prod.yml exec -T db \
    mysql -u root -p"${DB_ROOT_PASSWORD}" < "$FULL_BACKUP_DIR/database.sql"

# Start other services
echo -e "${YELLOW}Starting other services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Restore uploads
echo -e "${YELLOW}Restoring uploads...${NC}"
docker run --rm \
    --volumes-from games-review-board_frontend_1 \
    -v "$(pwd)/$FULL_BACKUP_DIR:/backup" \
    alpine sh -c "cd / && tar xzf /backup/uploads.tar.gz"

# Cleanup
rm -rf "$TEMP_DIR"

echo -e "${GREEN}Restore completed successfully!${NC}"
echo -e "Services are now running with restored data" 