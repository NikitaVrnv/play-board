// src/routes/gameRoutes.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export function createGameRouter(prisma: PrismaClient) {
  const router = express.Router();
  
  // GET /api/games
  router.get("/", async (req: Request, res: Response) => {
    try {
      console.log("Fetching games with query:", req.query);
      
      const { genre, search, sort } = req.query as Record<string, string>;
      
      // Build where clause
      const where: any = { status: "APPROVED" };
      
      if (genre && genre !== "any") {
        where.genre = genre;
      }
      
      if (search) {
        // MySQL compatible search (no mode: "insensitive")
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
        ];
      }
      
      // Determine sort order
      let orderBy: any = {};
      
      switch (sort) {
        case "newest":
          orderBy = { releaseDate: "desc" };
          break;
        case "oldest":
          orderBy = { releaseDate: "asc" };
          break;
        case "highest-rated":
          orderBy = { averageRating: "desc" };
          break;
        case "lowest-rated":
          orderBy = { averageRating: "asc" };
          break;
        case "most-reviewed":
          orderBy = { reviewCount: "desc" };
          break;
        default:
          // Default sort
          orderBy = { title: "asc" };
      }
      
      console.log("Query:", {
        where,
        orderBy: Object.keys(orderBy).length ? orderBy : undefined
      });
      
      // Execute the query
      const games = await prisma.game.findMany({
        where,
        orderBy: Object.keys(orderBy).length ? orderBy : undefined,
        include: {
          company: true,
        },
      });
      
      console.log(`Found ${games.length} games`);
      res.json(games);
    } catch (err) {
      console.error("Error fetching games:", err);
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });
  
  // GET /api/games/:id
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      console.log(`Fetching game with ID: ${req.params.id}`);
      
      const game = await prisma.game.findUnique({
        where: { id: req.params.id },
        include: {
          company: true
        },
      });
      
      if (!game) {
        console.log(`Game not found with ID: ${req.params.id}`);
        return res.status(404).json({ error: "Game not found" });
      }
      
      console.log(`Successfully fetched game: ${game.title}`);
      res.json(game);
    } catch (err) {
      console.error("Error fetching game details:", err);
      res.status(500).json({ error: "Failed to fetch game details" });
    }
  });
  
  return router;
}