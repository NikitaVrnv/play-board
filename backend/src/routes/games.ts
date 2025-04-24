import express from 'express';
import { z } from 'zod';
import { pool } from '../index';
import { authenticateToken } from '../index';
import jwt from "jsonwebtoken";

const router = express.Router();

// Validation schemas
const gameSchema = z.object({
  title: z.string().min(2).max(100),
  author: z.string().min(2).max(100),
  genre: z.string().min(1),
  description: z.string().min(10).max(2000),
  coverImage: z.string().url(),
  releaseDate: z.string().optional(),
  company: z.string().optional(),
  composer: z.string().optional(),
});

// Get all games with optional filters
router.get('/', async (req, res) => {
  try {
    const { genre, search, sort } = req.query;
    
    let query = `
      SELECT g.*, 
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM games g
      LEFT JOIN reviews r ON g.id = r.game_id
    `;
    
    const params: any[] = [];
    
    if (genre && genre !== 'any') {
      query += ' WHERE g.genre = ?';
      params.push(genre);
    }
    
    if (search) {
      query += params.length ? ' AND' : ' WHERE';
      query += ` (g.title LIKE ? OR g.author LIKE ? OR g.description LIKE ? OR g.company LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ' GROUP BY g.id';
    
    if (sort) {
      switch (sort) {
        case 'newest':
          query += ' ORDER BY g.release_date DESC';
          break;
        case 'oldest':
          query += ' ORDER BY g.release_date ASC';
          break;
        case 'highest-rated':
          query += ' ORDER BY average_rating DESC';
          break;
        case 'lowest-rated':
          query += ' ORDER BY average_rating ASC';
          break;
        case 'most-reviewed':
          query += ' ORDER BY review_count DESC';
          break;
      }
    }
    
    const [games] = await pool.execute(query, params);
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get a specific game
router.get('/:id', async (req, res) => {
  try {
    const [games] = await pool.execute(
      `SELECT g.*, 
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM games g
      LEFT JOIN reviews r ON g.id = r.game_id
      WHERE g.id = ?
      GROUP BY g.id`,
      [req.params.id]
    );
    
    const game = Array.isArray(games) && games[0];
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Add a new game (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const gameData = gameSchema.parse(req.body);
    
    const [result] = await pool.execute(
      `INSERT INTO games (
        title, author, genre, description, cover_image, 
        release_date, company, composer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gameData.title,
        gameData.author,
        gameData.genre,
        gameData.description,
        gameData.coverImage,
        gameData.releaseDate || null,
        gameData.company || null,
        gameData.composer || null,
      ]
    );
    
    res.status(201).json({
      id: result.insertId,
      ...gameData,
      averageRating: 0,
      reviewCount: 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error adding game:', error);
      res.status(500).json({ error: 'Failed to add game' });
    }
  }
});

// Get all genres
router.get('/genres/all', async (req, res) => {
  try {
    const [genres] = await pool.execute('SELECT DISTINCT genre FROM games');
    res.json(genres.map((g: any) => g.genre));
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
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


export const gamesRouter = router; 