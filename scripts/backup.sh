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

# Create backup directory
BACKUP_DIR="backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting backup process...${NC}"

# Backup database
echo -e "${YELLOW}Backing up database...${NC}"
docker-compose -f docker-compose.prod.yml exec -T db \
    mysqldump -u root -p"${DB_ROOT_PASSWORD}" \
    --databases ${DB_NAME} \
    --add-drop-database \
    --add-drop-table \
    --create-options \
    --quote-names \
    --single-transaction \
    --quick \
    --set-charset \
    --routines \
    --triggers \
    --events \
    > "${BACKUP_DIR}/database.sql"

# Backup uploads
echo -e "${YELLOW}Backing up uploads...${NC}"
docker run --rm \
    --volumes-from games-review-board_frontend_1 \
    -v "$(pwd)/${BACKUP_DIR}:/backup" \
    alpine tar czf /backup/uploads.tar.gz /app/uploads

# Create metadata file
echo -e "${YELLOW}Creating backup metadata...${NC}"
cat > "${BACKUP_DIR}/metadata.json" << EOF
{
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "version": "$(git describe --tags --always)",
    "database": "database.sql",
    "uploads": "uploads.tar.gz"
}
EOF

# Create archive
echo -e "${YELLOW}Creating backup archive...${NC}"
tar czf "${BACKUP_DIR}.tar.gz" -C backups "$(date +%Y-%m-%d)"

# Cleanup
rm -rf "$BACKUP_DIR"

echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "Backup file: ${BACKUP_DIR}.tar.gz" 