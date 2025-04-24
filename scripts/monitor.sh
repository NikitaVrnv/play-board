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

# Function to check service health
check_service() {
    local service=$1
    local url=$2
    echo -n "Checking $service... "
    
    if curl -s -f "$url" > /dev/null; then
        echo -e "${GREEN}OK${NC}"
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        return 1
    fi
}

# Function to check database
check_database() {
    echo -n "Checking database... "
    if docker-compose -f docker-compose.prod.yml exec -T db mysqladmin status > /dev/null; then
        echo -e "${GREEN}OK${NC}"
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        return 1
    fi
}

# Function to get container stats
show_container_stats() {
    local container=$1
    echo -e "\n${YELLOW}Stats for $container:${NC}"
    docker stats --no-stream $container
}

# Function to show recent logs
show_recent_logs() {
    local service=$1
    local lines=${2:-50}
    echo -e "\n${YELLOW}Recent logs for $service:${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=$lines $service
}

# Main monitoring loop
while true; do
    clear
    echo -e "${YELLOW}Games Review Board - System Monitor${NC}"
    echo -e "Time: $(date)"
    echo -e "----------------------------------------"
    
    # Check services
    check_service "Frontend" "http://localhost"
    check_service "Backend API" "http://localhost:3000/api/health"
    check_database
    
    # Show container stats
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Show container resource usage
    echo -e "\n${YELLOW}Resource Usage:${NC}"
    docker stats --no-stream $(docker ps -q)
    
    # Show recent errors from logs
    echo -e "\n${YELLOW}Recent Errors:${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=20 | grep -i "error"
    
    # Wait before next check
    sleep 30
done 