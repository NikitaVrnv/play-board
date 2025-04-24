// src/types/express.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;       // Changed from userId to id to match your middleware
        email?: string;   // Made optional since your middleware doesn't set this
        username: string;
        role?: string;    // Keep as optional
      };
    }
  }
}

export {};