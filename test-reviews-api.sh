// Simple Node.js script to test the review API
// No dependencies - just run with: node test-reviews-endpoint.js

const http = require('http');

// Configuration
const API_HOST = 'localhost';
const API_PORT = 4000;
const GAME_ID = 'reforger-0001'; // This should be a valid game ID in your database
const TOKEN = 'c3d8dfafb481eebc08845ab604ee7e7e2613012efa6090e9f299334fff99cf17';

// Define test cases
const tests = [
  // Test 1: GET /api/test (to confirm server is running)
  {
    method: 'GET',
    path: '/api/test',
    headers: {},
    body: null,
    description: 'Test if server is running'
  },
  // Test 2: GET /api/genres
  {
    method: 'GET',
    path: '/api/genres',
    headers: {},
    body: null,
    description: 'Get all genres'
  },
  // Test 3: GET /api/reviews
  {
    method: 'GET',
    path: '/api/reviews',
    headers: {},
    body: null,
    description: 'Get all reviews'
  },
  // Test 4: POST /api/reviews
  {
    method: 'POST',
    path: '/api/reviews',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      gameId: GAME_ID,
      rating: 5,
      comment: 'Test review created via direct script'
    }),
    description: 'Create a new review'
  }
];

// Helper function to perform HTTP requests
function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

// Run all tests sequentially
async function runTests() {
  console.log('🧪 Running API tests...\n');
  
  for (const [index, test] of tests.entries()) {
    console.log(`\n[Test ${index + 1}] ${test.description}`);
    console.log(`${test.method} ${test.path}`);
    
    try {
      const options = {
        hostname: API_HOST,
        port: API_PORT,
        path: test.path,
        method: test.method,
        headers: test.headers
      };
      
      const response = await makeRequest(options, test.body);
      
      console.log(`Status: ${response.statusCode}`);
      console.log('Response headers:', response.headers);
      
      try {
        // Try to parse as JSON
        const jsonData = JSON.parse(response.body);
        console.log('Response body (JSON):', JSON.stringify(jsonData, null, 2).substring(0, 500) + (JSON.stringify(jsonData, null, 2).length > 500 ? '...' : ''));
      } catch (e) {
        // If not JSON, show as text
        console.log('Response body (text):', response.body.substring(0, 500) + (response.body.length > 500 ? '...' : ''));
      }
      
      // Check for success or failure
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log('✅ Test passed');
      } else {
        console.log('❌ Test failed');
      }
    } catch (error) {
      console.error('❌ Test error:', error.message);
    }
  }
  
  console.log('\n🏁 All tests completed');
}

// Start the test run
runTests();