// Simplified server that works with ES modules
// Run with: node simplified-server.js

import express from 'express';
import cors from 'cors';

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running correctly' });
});

// Genres endpoint
app.get('/api/genres', (req, res) => {
  res.json([
    "Action", "Adventure", "RPG", "Strategy", "Simulation",
    "Sports", "Puzzle", "Shooter", "Platformer", "Horror",
    "Racing", "Fighting", "Educational", "Sandbox", "Other",
  ]);
});

// Reviews endpoints
app.get('/api/reviews', (req, res) => {
  // Return a dummy empty array as placeholder
  res.json([]);
});

app.post('/api/reviews', (req, res) => {
  console.log('Review submission received:', req.body);
  
  // Validate the request
  const { gameId, rating, comment } = req.body;
  if (!gameId || rating === undefined) {
    return res.status(400).json({ error: 'Game ID and rating are required' });
  }
  
  // In a real implementation, we would save to database here
  // For now, just return a dummy successful response
  res.status(201).json({
    id: 'dummy-review-' + Date.now(),
    gameId,
    rating,
    comment,
    userId: 'test-user',
    username: 'Test User',
    createdAt: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`
  ✅ Simplified server running on http://localhost:${PORT}
  
  Available endpoints:
  - GET  http://localhost:${PORT}/api/test
  - GET  http://localhost:${PORT}/api/genres
  - GET  http://localhost:${PORT}/api/reviews
  - POST http://localhost:${PORT}/api/reviews
  
  Try this curl command to test the POST endpoint:
  curl -X POST http://localhost:${PORT}/api/reviews \\
    -H "Content-Type: application/json" \\
    -d '{"gameId":"reforger-0001","rating":5,"comment":"Test review"}'
  `);
});