import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllGames(req: Request, res: Response) {
  try {
    const { genre, search, sort } = req.query;

    let whereClause: any = {};
    
    if (genre) {
      whereClause.genre = String(genre);
    }
    
    if (search) {
      const searchTerm = String(search).toLowerCase();
      whereClause.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { author: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { company: { name: { contains: searchTerm } } }
      ];
    }
    
    let orderBy: any = {};
    
    if (sort) {
      switch (String(sort)) {
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
      }
    }
    
    const games = await prisma.game.findMany({
      where: whereClause,
      orderBy: Object.keys(orderBy).length ? orderBy : undefined,
      include: {
        company: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    return res.status(200).json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return res.status(500).json({ error: "Failed to fetch games" });
  }
}

export async function getGameById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    console.log("Requested game ID:", id); // Add this for debugging
    
    const game = await prisma.game.findUnique({
      where: { id: String(id) }, // Ensure ID is treated as string
      include: {
        company: true,
        reviews: true,
        tags: { include: { tag: true } }
      }
    });
    
    if (!game) {
      console.log("Game not found for ID:", id); // Add this for debugging
      return res.status(404).json({ error: "Game not found" });
    }
    
    return res.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function createGame(req: Request, res: Response) {
  try {
    // Authentication is required for this endpoint
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const { 
      title, 
      coverImage, 
      author, 
      genre, 
      description, 
      releaseDate, 
      composer, 
      companyId,
      tags
    } = req.body;
    
    // Validate required fields
    if (!title || !author || !genre || !companyId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    // Create game
    const newGame = await prisma.game.create({
      data: {
        title,
        coverImage,
        author,
        genre,
        description,
        releaseDate,
        composer,
        averageRating: 0,
        reviewCount: 0,
        companyId,
        companyName: company.name
      }
    });
    
    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      await Promise.all(
        tags.map(async (tagId: string) => {
          await prisma.gameTag.create({
            data: {
              gameId: newGame.id,
              tagId
            }
          });
        })
      );
    }
    
    // Get game with relations
    const gameWithRelations = await prisma.game.findUnique({
      where: { id: newGame.id },
      include: {
        company: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    return res.status(201).json(gameWithRelations);
  } catch (error) {
    console.error("Error creating game:", error);
    return res.status(500).json({ error: "Failed to create game" });
  }
}

export async function updateGame(req: Request, res: Response) {
  try {
    // Authentication is required for this endpoint
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const { id } = req.params;
    const { 
      title, 
      coverImage, 
      author, 
      genre, 
      description, 
      releaseDate, 
      composer, 
      companyId,
      tags
    } = req.body;
    
    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id }
    });
    
    if (!existingGame) {
      return res.status(404).json({ error: "Game not found" });
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (title) updateData.title = title;
    if (coverImage) updateData.coverImage = coverImage;
    if (author) updateData.author = author;
    if (genre) updateData.genre = genre;
    if (description) updateData.description = description;
    if (releaseDate) updateData.releaseDate = releaseDate;
    if (composer) updateData.composer = composer;
    
    // If company is changed, update company name too
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });
      
      if (!company) {
        return res.status(400).json({ error: "Invalid company ID" });
      }
      
      updateData.companyId = companyId;
      updateData.companyName = company.name;
    }
    
    // Update game
    const updatedGame = await prisma.game.update({
      where: { id },
      data: updateData
    });
    
    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Remove existing tags
      await prisma.gameTag.deleteMany({
        where: { gameId: id }
      });
      
      // Add new tags
      if (tags.length > 0) {
        await Promise.all(
          tags.map(async (tagId: string) => {
            await prisma.gameTag.create({
              data: {
                gameId: id,
                tagId
              }
            });
          })
        );
      }
    }
    
    // Get game with relations
    const gameWithRelations = await prisma.game.findUnique({
      where: { id },
      include: {
        company: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    return res.status(200).json(gameWithRelations);
  } catch (error) {
    console.error("Error updating game:", error);
    return res.status(500).json({ error: "Failed to update game" });
  }
}

export async function deleteGame(req: Request, res: Response) {
  try {
    // Only admins can delete games
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const { id } = req.params;
    
    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id }
    });
    
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    
    // Delete game (this will also delete related reviews and game tags due to cascade)
    await prisma.game.delete({
      where: { id }
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting game:", error);
    return res.status(500).json({ error: "Failed to delete game" });
  }
}

export async function getGameReviews(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const reviews = await prisma.review.findMany({
      where: { gameId: id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });
    
    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching game reviews:", error);
    return res.status(500).json({ error: "Failed to fetch game reviews" });
  }
}

export async function getGenres(req: Request, res: Response) {
  try {
    // Return list of predefined genres
    return res.status(200).json([
      "Action",
      "Adventure",
      "RPG",
      "Strategy",
      "Simulation",
      "Sports",
      "Puzzle",
      "Shooter",
      "Platformer",
      "Horror",
      "Racing",
      "Fighting",
      "Educational",
      "Sandbox",
      "Other"
    ]);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return res.status(500).json({ error: "Failed to fetch genres" });
  }
}