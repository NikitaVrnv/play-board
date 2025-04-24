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

echo -e "${YELLOW}Starting deployment...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Generate SSL certificates if they don't exist
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo -e "${YELLOW}Generating SSL certificates...${NC}"
    mkdir -p ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem -out ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
fi

# Build and deploy
echo -e "${YELLOW}Building and deploying services...${NC}"

# Stop and remove existing containers
docker-compose -f docker-compose.prod.yml down

# Build new images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
until docker-compose -f docker-compose.prod.yml exec db mysqladmin ping -h localhost --silent; do
    echo -n "."
    sleep 1
done

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml exec api npm run migrate

# Run database seeds if specified
if [ "$1" = "--seed" ]; then
    echo -e "${YELLOW}Seeding database...${NC}"
    docker-compose -f docker-compose.prod.yml exec api npm run seed
fi

# Check service health
echo -e "${YELLOW}Checking service health...${NC}"

# Check frontend
if curl -s -f http://localhost > /dev/null; then
    echo -e "${GREEN}Frontend is running${NC}"
else
    echo -e "${RED}Frontend is not responding${NC}"
fi

# Check backend
if curl -s -f http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}Backend API is running${NC}"
else
    echo -e "${RED}Backend API is not responding${NC}"
fi

# Check database
if docker-compose -f docker-compose.prod.yml exec db mysqladmin status > /dev/null; then
    echo -e "${GREEN}Database is running${NC}"
else
    echo -e "${RED}Database is not responding${NC}"
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "Frontend: http://localhost"
echo -e "Backend API: http://localhost:3000"

# Show logs
echo -e "${YELLOW}Showing logs (Ctrl+C to exit)...${NC}"
docker-compose -f docker-compose.prod.yml logs -f 