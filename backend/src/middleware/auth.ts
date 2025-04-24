// src/middleware/auth.ts
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "@/types";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  
  const token = auth.slice(7);
  
  try {
    console.log("Validating token:", token.substring(0, 15) + "...");
    
    const payload = jwt.verify(token, JWT_SECRET) as any;
    console.log("Decoded token payload:", payload);
    
    // FIXED: Use payload.id instead of payload.userId
    const userId = payload.id; // This matches the field name used in token generation
    
    if (!userId) {
      console.error("Token missing id field. Available fields:", Object.keys(payload));
      return res.status(401).json({ error: "Invalid token format" });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
      },
    });
    
    if (!user) {
      console.log("User not found with id:", userId);
      return res.status(401).json({ error: "User not found" });
    }
    
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar ?? undefined,
    };
    
    console.log("User authenticated:", user.username);
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}
