// Minimal server implementation focusing on reviews routes
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const app = express();
const prisma = new PrismaClient();

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Dummy auth middleware for testing
app.use((req: any, res, next) => {
  // For testing purposes, simulate an authenticated user
  req.user = {
    userId: "test-user-1",
    email: "test@example.com",
    username: "TestUser",
    role: "user"
  };
  next();
});

// Direct review routes (no imports, just inline handlers)
// -------------------------------------------------------

// GET /api/reviews - Get all reviews
app.get("/api/reviews", async (req: Request, res: Response) => {
  try {
    const gameId = req.query.gameId as string | undefined;
    const where = gameId ? { gameId } : {};

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        game: { select: { id: true, title: true, coverImage: true } },
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/reviews - Create a new review
app.post("/api/reviews", async (req: Request, res: Response) => {
  try {
    const { gameId, rating, comment } = req.body;
    const user = (req as any).user;

    console.log("Creating review with:", { gameId, rating, comment, user });

    if (!gameId || rating === undefined) {
      return res.status(400).json({ error: "Game ID and rating are required" });
    }

    // Check if game exists
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return res.status(400).json({ error: "Game not found" });
    }

    // Check for existing review
    const existingReview = await prisma.review.findFirst({
      where: { gameId, userId: user.userId },
    });

    if (existingReview) {
      return res.status(400).json({ error: "You've already reviewed this game" });
    }

    // Get the user
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) {
      return res.status(400).json({ error: "User not found" });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || "",
        gameId,
        userId: dbUser.id,
        username: dbUser.username,
        userAvatar: dbUser.avatar,
      },
    });

    console.log("Review created:", review);

    // Update game stats
    const allReviews = await prisma.review.findMany({ where: { gameId } });
    const avg =
      Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10;

    await prisma.game.update({
      where: { id: gameId },
      data: { averageRating: avg, reviewCount: allReviews.length },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Simple test routes to verify server is working
app.get("/api/test", (_req, res) => {
  res.json({ message: "Test route is working" });
});

// Genres route (since it was failing in your original server)
app.get("/api/genres", (_req, res) => {
  res.json([
    "Action", "Adventure", "RPG", "Strategy", "Simulation",
    "Sports", "Puzzle", "Shooter", "Platformer", "Horror",
    "Racing", "Fighting", "Educational", "Sandbox", "Other",
  ]);
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test the API with these endpoints:
  - GET  http://localhost:${PORT}/api/test
  - GET  http://localhost:${PORT}/api/reviews
  - POST http://localhost:${PORT}/api/reviews (with JSON body)
  - GET  http://localhost:${PORT}/api/genres`);
});