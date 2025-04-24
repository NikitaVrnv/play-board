#!/bin/bash

# Configuration
DB_NAME="games_review_board"
BACKUP_DIR="./backups"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Available backups:"
    ls -l "$BACKUP_DIR"/*.sql.gz
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file $BACKUP_FILE does not exist!"
    exit 1
fi

# Confirm restore
read -p "Are you sure you want to restore from $BACKUP_FILE? This will overwrite the current database. (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

# Restore database
echo "Restoring database from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | mysql

echo "Restore completed successfully!" 