import express from 'express';
import { z } from 'zod';
import { pool } from '../index';
import { authenticateToken } from '../index';
import jwt from "jsonwebtoken";

const router = express.Router();

// Validation schemas
const reviewSchema = z.object({
  gameId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(500),
});

// Get reviews for a game
router.get('/game/:gameId', async (req, res) => {
  try {
    const [reviews] = await pool.execute(
      `SELECT r.*, u.username, u.avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.game_id = ?
      ORDER BY r.created_at DESC`,
      [req.params.gameId]
    );
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Add a review (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { gameId, rating, comment } = reviewSchema.parse(req.body);
    
    // Check if user has already reviewed this game
    const [existingReviews] = await pool.execute(
      'SELECT * FROM reviews WHERE game_id = ? AND user_id = ?',
      [gameId, req.user.id]
    );
    
    if (Array.isArray(existingReviews) && existingReviews.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this game' });
    }
    
    // Add the review
    const [result] = await pool.execute(
      `INSERT INTO reviews (game_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)`,
      [gameId, req.user.id, rating, comment]
    );
    
    // Get the created review with user details
    const [reviews] = await pool.execute(
      `SELECT r.*, u.username, u.avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?`,
      [result.insertId]
    );
    
    const review = Array.isArray(reviews) && reviews[0];
    
    if (!review) {
      throw new Error('Failed to fetch created review');
    }
    
    // Update game's average rating
    await pool.execute(
      `UPDATE games g
      SET average_rating = (
        SELECT AVG(rating)
        FROM reviews
        WHERE game_id = ?
      ),
      review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE game_id = ?
      )
      WHERE g.id = ?`,
      [gameId, gameId, gameId]
    );
    
    res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error adding review:', error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  }
  
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, username, email, avatar FROM users WHERE id = ?",
      [req.user.id]
    );
    const user = Array.isArray(users) && users[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    res.status(500).json({ error: "Could not fetch user" });
  }
});


export const reviewsRouter = router; 