import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../index';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  avatar: string;
}

const router = express.Router();

// Validation schemas
const userSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = userSchema.parse(req.body);
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create avatar URL using DiceBear
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    
    // Insert new user
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, avatarUrl]
    ) as unknown as [ResultSetHeader];
    
    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, username, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      id: result.insertId,
      username,
      email,
      avatar: avatarUrl,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = z.object({
      usernameOrEmail: z.string(),
      password: z.string(),
    }).parse(req.body);
    
    // Get user from database
    const [users] = await pool.execute<[User[]]>(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail]
    );
    
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
});

export const authRouter = router; 