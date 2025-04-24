// backend/src/controllers/authController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret-change-this";
const JWT_EXPIRES_IN = "7d";

// Utility to generate a JWT
const generateToken = (user: { id: string; email: string; username: string }) =>
  jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// @route   POST /api/auth/register
// @desc    Register new user
export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already in use" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        avatar,
      },
    });

    const token = generateToken({ id: user.id, email: user.email, username: user.username });

    return res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
    console.error("📍 Full stack:", error.stack);
    return res.status(500).json({ error: "Server error during login" });
  }  
}

// @route   POST /api/auth/login
// @desc    Login user
// @route   POST /api/auth/login
// @desc    Login user
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Fix: use email directly as a string, not as an object
    const user = await prisma.user.findUnique({ 
      where: { email: email } 
    });

    if (!user) {
      console.warn("⚠️ User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      console.warn("⚠️ Invalid password for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
    console.error("📍 Stack trace:", error.stack);
    return res.status(500).json({ error: "Server error during login" });
  }
}

// @route   GET /api/auth/profile
// @desc    Get current user profile
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id; // populated by auth middleware

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("❌ Get profile error:", error);
    return res.status(500).json({ error: "Server error while getting profile" });
  }
}
