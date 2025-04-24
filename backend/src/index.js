
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const reviewsRoutes = require('./routes/reviews');
const companiesRoutes = require('./routes/companies');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/games', gamesRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/companies', companiesRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Games Review Board API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
