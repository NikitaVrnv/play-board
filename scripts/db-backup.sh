#!/bin/bash

# Configuration
DB_NAME="games_review_board"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup database
echo "Backing up database $DB_NAME to $BACKUP_FILE..."
mysqldump --single-transaction --routines --triggers --events \
    --add-drop-database --databases "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"

# Keep only last 7 backups
echo "Cleaning up old backups..."
ls -t "$BACKUP_DIR"/*.sql.gz | tail -n +8 | xargs rm -f

echo "Backup completed successfully!" 