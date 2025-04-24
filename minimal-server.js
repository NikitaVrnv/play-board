// Minimal server with inline routes - no imports from other files
// Save this as minimal-server.js and run with: node minimal-server.js

import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --- Simple test routes ---
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working correctly' });
});

// --- Genres route ---
app.get('/api/genres', (req, res) => {
  res.json([
    "Action", "Adventure", "RPG", "Strategy", "Simulation",
    "Sports", "Puzzle", "Shooter", "Platformer", "Horror",
    "Racing", "Fighting", "Educational", "Sandbox", "Other",
  ]);
});

// --- Simple reviews routes ---
app.get('/api/reviews', (req, res) => {
  res.json([]);
});

app.post('/api/reviews', (req, res) => {
  console.log('Review submission received:', req.body);
  
  // Validate the request
  const { gameId, rating, comment } = req.body;
  if (!gameId || rating === undefined) {
    return res.status(400).json({ error: 'Game ID and rating are required' });
  }
  
  // For testing, just return a dummy response
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

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`
  ✅ Minimal server running on http://localhost:${PORT}
  
  Available endpoints:
  - GET  http://localhost:${PORT}/api/test
  - GET  http://localhost:${PORT}/api/genres
  - GET  http://localhost:${PORT}/api/reviews
  - POST http://localhost:${PORT}/api/reviews
  
  Test with curl:
  curl http://localhost:${PORT}/api/test
  curl http://localhost:${PORT}/api/genres
  curl http://localhost:${PORT}/api/reviews
  curl -X POST http://localhost:${PORT}/api/reviews -H "Content-Type: application/json" -d '{"gameId":"reforger-0001","rating":5,"comment":"Test review"}'
  `);
});