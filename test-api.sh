#!/bin/bash
# Simple API test script

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:4000/api"
GAME_ID="reforger-0001"
TOKEN="c3d8dfafb481eebc08845ab604ee7e7e2613012efa6090e9f299334fff99cf17"

echo -e "${YELLOW}API Test Script${NC}"
echo "=================="

# Function to make a request and display results
test_endpoint() {
  local method=$1
  local endpoint=$2
  local description=$3
  local data=$4
  local headers=$5

  echo -e "\n${YELLOW}Testing: ${description}${NC}"
  echo "${method} ${endpoint}"
  
  # Build curl command
  cmd="curl -s -X ${method} ${API_URL}${endpoint}"
  
  # Add headers if provided
  if [ -n "$headers" ]; then
    cmd="${cmd} ${headers}"
  fi
  
  # Add data if provided
  if [ -n "$data" ]; then
    cmd="${cmd} -d '${data}'"
  fi
  
  # Execute the command
  response=$(eval ${cmd})
  
  # Display raw response
  echo -e "\nResponse:"
  echo "${response}"
  
  # Check if it's JSON and valid
  if echo "${response}" | grep -q "<!DOCTYPE html>"; then
    echo -e "\n${RED}ERROR: Received HTML instead of JSON${NC}"
    echo -e "${RED}The endpoint is likely not registered correctly${NC}"
  elif [ -z "${response}" ]; then
    echo -e "\n${RED}ERROR: Empty response${NC}"
  elif echo "${response}" | jq . >/dev/null 2>&1; then
    echo -e "\n${GREEN}Valid JSON response${NC}"
  else
    echo -e "\n${RED}Invalid JSON response${NC}"
  fi
  
  echo "----------------------------------------"
}

# Test 1: Basic test endpoint
test_endpoint "GET" "/test" "Basic test endpoint"

# Test 2: Genres endpoint
test_endpoint "GET" "/genres" "Get all genres"

# Test 3: Reviews endpoint
test_endpoint "GET" "/reviews" "Get all reviews"

# Test 4: Create a review
test_endpoint "POST" "/reviews" "Create a review" \
  '{"gameId":"'"${GAME_ID}"'","rating":5,"comment":"Test review"}' \
  "-H 'Content-Type: application/json' -H 'Authorization: Bearer ${TOKEN}'"

echo -e "\n${GREEN}All tests completed${NC}"