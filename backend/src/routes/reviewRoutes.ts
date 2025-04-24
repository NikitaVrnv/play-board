// src/routes/reviewRoutes.ts
import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export function createReviewRouter(prisma: PrismaClient) {
  const router = express.Router();
  
  // GET /api/reviews - Get reviews for a game
  router.get('/', async (req: AuthRequest, res: Response) => {
    try {
      const { gameId } = req.query;
      
      if (!gameId) {
        return res.status(400).json({ error: 'Game ID is required' });
      }
      
      console.log(`Fetching reviews for game ID: ${gameId}`);
      
      const reviews = await prisma.review.findMany({
        where: {
          gameId: gameId as string,
          status: 'APPROVED'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        }
      });
      
      // Transform reviews to match frontend expectations
      const formattedReviews = reviews.map(review => ({
        id: review.id,
        gameId: review.gameId,
        userId: review.userId,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        username: review.user.username,
        userRole: review.user.role
      }));
      
      console.log(`Found ${reviews.length} reviews for game ID: ${gameId}`);
      res.json(formattedReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });
  
  // POST /api/reviews - Add a review
  router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { gameId, rating, comment } = req.body;
      
      // Verify that req.user exists and has an id
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = req.user.id;
      
      if (!gameId || !rating || !comment) {
        return res.status(400).json({ error: 'Game ID, rating, and comment are required' });
      }
      
      // Check if user has already reviewed this game
      const existingReview = await prisma.review.findFirst({
        where: {
          gameId,
          userId
        }
      });
      
      if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this game' });
      }
      
      // Create the review
      const review = await prisma.review.create({
        data: {
          gameId,
          userId,
          rating: Number(rating),
          comment,
          status: 'APPROVED' // Auto-approve for now
        },
        include: {
          user: {
            select: {
              username: true,
              role: true
            }
          }
        }
      });
      
      // Update game average rating and review count
      const allReviews = await prisma.review.findMany({
        where: {
          gameId,
          status: 'APPROVED'
        }
      });
      
      const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await prisma.game.update({
        where: { id: gameId },
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: allReviews.length
        }
      });
      
      // Format the response to match frontend expectations
      const formattedReview = {
        ...review,
        username: review.user.username,
        userRole: review.user.role,
        user: undefined
      };
      
      res.status(201).json(formattedReview);
    } catch (err) {
      console.error('Error adding review:', err);
      res.status(500).json({ error: 'Failed to add review' });
    }
  });
  
  return router;
}
