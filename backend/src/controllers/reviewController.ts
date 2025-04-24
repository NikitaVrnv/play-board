// backend/src/controllers/reviewController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// —————————————————————————————————————————————————————————————
// GET /api/reviews?gameId=123
// —————————————————————————————————————————————————————————————
export async function getAllReviews(req: Request, res: Response) {
  try {
    const { gameId } = req.query;

    const where = gameId ? { gameId: String(gameId) } : {};

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        game: { select: { id: true, title: true, coverImage: true } },
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
}

// —————————————————————————————————————————————————————————————
// GET /api/reviews/:id
// —————————————————————————————————————————————————————————————
export async function getReviewById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        game: { select: { id: true, title: true, coverImage: true } },
      },
    });

    if (!review) return res.status(404).json({ error: "Review not found" });

    res.status(200).json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).json({ error: "Failed to fetch review" });
  }
}

// —————————————————————————————————————————————————————————————
// POST /api/reviews
// —————————————————————————————————————————————————————————————
export async function createReview(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });

    const { gameId, rating, comment } = req.body;
    
    // Debug log to see what we're receiving
    console.log("Create review request:", { 
      user: req.user, 
      body: req.body,
      headers: req.headers
    });

    if (!gameId || rating === undefined) {
      return res.status(400).json({ error: "Game ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return res.status(400).json({ error: "Game not found" });

    const existingReview = await prisma.review.findFirst({
      where: { gameId, userId: req.user.userId },
    });

    if (existingReview) {
      return res.status(400).json({ error: "You've already reviewed this game" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(400).json({ error: "User not found" });

    console.log("About to create review with data:", {
      rating,
      comment,
      gameId,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
    });

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        gameId,
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar,
      },
    });

    console.log("✅ Review created:", review);

    // update game stats
    const allReviews = await prisma.review.findMany({ where: { gameId } });
    const avg =
      Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10;

    await prisma.game.update({
      where: { id: gameId },
      data: { averageRating: avg, reviewCount: allReviews.length },
    });

    const fullReview = await prisma.review.findUnique({
      where: { id: review.id },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        game: { select: { id: true, title: true, coverImage: true } },
      },
    });

    res.status(201).json(fullReview);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
}

// —————————————————————————————————————————————————————————————
// PUT /api/reviews/:id
// —————————————————————————————————————————————————————————————
export async function updateReview(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });

    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (review.userId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "You can only update your own reviews" });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating, comment },
    });

    // recalculate stats
    const allReviews = await prisma.review.findMany({ where: { gameId: review.gameId } });
    const avg =
      Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10;

    await prisma.game.update({
      where: { id: review.gameId },
      data: { averageRating: avg },
    });

    const reviewWithDetails = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        game: { select: { id: true, title: true, coverImage: true } },
      },
    });

    res.status(200).json(reviewWithDetails);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
}

// —————————————————————————————————————————————————————————————
// DELETE /api/reviews/:id
// —————————————————————————————————————————————————————————————
export async function deleteReview(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });

    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (review.userId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "You can only delete your own reviews" });
    }

    const gameId = review.gameId;

    await prisma.review.delete({ where: { id } });

    const remaining = await prisma.review.findMany({ where: { gameId } });

    const reviewCount = remaining.length;
    const avg = reviewCount > 0
      ? Math.round((remaining.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : 0;

    await prisma.game.update({
      where: { id: gameId },
      data: { averageRating: avg, reviewCount },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
}

// —————————————————————————————————————————————————————————————
// GET /api/reviews/user/:userId?
// —————————————————————————————————————————————————————————————
export async function getUserReviews(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });

    const userId = req.params.userId || req.user.userId;

    if (userId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const reviews = await prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        game: {
          select: { id: true, title: true, coverImage: true, genre: true },
        },
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ error: "Failed to fetch user reviews" });
  }
}