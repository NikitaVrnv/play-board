#!/bin/bash
# Debug script for review API endpoints

# Set base URL
BASE_URL="http://localhost:4000/api"

# Your JWT token (replace with a valid token)
TOKEN="c3d8dfafb481eebc08845ab604ee7e7e2613012efa6090e9f299334fff99cf17"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Debugging Review API Endpoints${NC}"
echo "=============================="

# Test 1: Check raw response for GET /reviews
echo -e "\n${YELLOW}Test 1: GET all reviews (raw response)${NC}"
RAW_RESPONSE=$(curl -s $BASE_URL/reviews)
echo -e "Raw response: ${RED}$RAW_RESPONSE${NC}"

# Test 2: Use verbose curl to see headers
echo -e "\n${YELLOW}Test 2: GET all reviews with verbose output${NC}"
curl -v $BASE_URL/reviews

# Test 3: Check if /api/reviews route exists by listing all routes
echo -e "\n${YELLOW}Test 3: Check other API endpoints${NC}"
echo "Checking genres endpoint (should work):"
curl -s $BASE_URL/genres
echo -e "\n\nChecking games endpoint (should work):"
curl -s $BASE_URL/games | head -n 20

# Test 4: POST a review with verbose output
echo -e "\n${YELLOW}Test 4: POST a new review with verbose output${NC}"
curl -v -X POST $BASE_URL/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"gameId":"reforger-0001","rating":5,"comment":"Test review created via script"}'

# Test 5: Check server directory setup
echo -e "\n${YELLOW}Test 5: Directory structure check${NC}"
echo "Please verify these files exist in your project:"
echo "- backend/src/controllers/reviewController.ts"
echo "- backend/src/routes/reviewRoutes.ts"
echo "- backend/src/middleware/authMiddleware.ts"
echo "- backend/src/server.ts"

# Test 6: Check if server.ts imports and uses reviewRoutes correctly
echo -e "\n${YELLOW}Test 6: Server routes imports${NC}"
echo "Make sure server.ts has this line:"
echo "app.use(\"/api/reviews\", reviewRoutes);"

echo -e "\n${YELLOW}Testing complete! Based on the responses above, check for any HTML error messages returned instead of JSON.${NC}"