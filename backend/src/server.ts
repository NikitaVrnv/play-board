// backend/src/server.ts
import "iconv-lite/encodings";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./middleware/authMiddleware";

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "change-me";

// — Log every incoming request
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// — Body parser & CORS
app.use(cors());
app.use(express.json());

// — Helper for 500 errors
function handleError(res: Response, err: any) {
  console.error("API Error:", err);
  res.status(500).json({ error: err.message || "Internal error" });
}

// --- Test Route ---
app.get("/api/test", (_req, res) => {
  res.json({ message: "API is working correctly" });
});

// --- Auth Routes ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password required" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, passwordHash: hash },
    });
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ user, token });
  } catch (err) {
    handleError(res, err);
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ user, token });
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/api/auth/profile", authMiddleware, async (req: Request, res) => {
  try {
    // Log the user ID for debugging
    console.log("GET /api/auth/profile for user ID:", req.user?.id);
    
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log("User not found for profile:", req.user!.id);
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log("Profile found for user:", user.username);
    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// --- Game Routes ---
app.get("/api/games", async (req, res) => {
  try {
    console.log("Fetching games with query:", req.query);
    const { genre, search, sort } = req.query as Record<string, string>;
    
    const where: any = { status: 'APPROVED' };
    
    // Only add genre if it's a valid value (not 'undefined' string)
    if (genre && genre !== 'undefined') {
      where.genre = genre;
    }
    let games = await prisma.game.findMany({
      where,
      include: { company: true, tags: { include: { tag: true } } },
    });
    if (sort) {
      const cmp: Record<string, (a: any, b: any) => number> = {
        newest: (a, b) => Date.parse(b.releaseDate) - Date.parse(a.releaseDate),
        oldest: (a, b) => Date.parse(a.releaseDate) - Date.parse(b.releaseDate),
        "highest-rated": (a, b) => b.averageRating - a.averageRating,
        "lowest-rated": (a, b) => a.averageRating - b.averageRating,
        "most-reviewed": (a, b) => b.reviewCount - a.reviewCount,
      };
      games = [...games].sort(cmp[sort] || (() => 0));
    }
    res.json(games);
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/api/games/:id", async (req, res) => {
  try {
    console.log(`GET /api/games/${req.params.id}`);
    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
      include: { company: true, tags: { include: { tag: true } } },
    });
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json(game);
  } catch (err) {
    handleError(res, err);
  }
});

// --- Static / Lookup Data ---
app.get("/api/genres", (_req, res) => {
  console.log("GET /api/genres");
  res.json([
    "Action", "Adventure", "RPG", "Strategy", "Simulation",
    "Sports", "Puzzle", "Shooter", "Platformer", "Horror",
    "Racing", "Fighting", "Educational", "Sandbox", "Other",
  ]);
});

app.get("/api/companies", async (_req, res) => {
  try {
    const companies = await prisma.company.findMany();
    res.json(companies);
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/api/companies/:id", async (req, res) => {
  try {
    const c = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json(c);
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/api/tags", async (_req, res) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (err) {
    handleError(res, err);
  }
});

// --- REVIEW ROUTES ---
app.get("/api/reviews", async (req, res) => {
  try {
    console.log("GET /api/reviews", req.query);
    const gameId = String(req.query.gameId || "");
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
  } catch (err) {
    handleError(res, err);
  }
});



app.post("/api/reviews", authMiddleware, async (req, res) => {
  try {
    console.log("POST /api/reviews", req.body, req.user);
    const { gameId, rating, comment } = req.body;
    if (!gameId || rating == null) {
      return res.status(400).json({ error: "gameId and rating are required" });
    }
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return res.status(400).json({ error: "Game not found" });
    const existing = await prisma.review.findFirst({
      where: { gameId, userId: req.user!.id },
    });
    if (existing) {
      return res.status(400).json({ error: "You've already reviewed this game" });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(400).json({ error: "User not found" });
    const review = await prisma.review.create({
      data: {
        gameId,
        userId: user.id,
        rating,
        comment: comment || "",
        username: user.username,
        userAvatar: user.avatar,
      },
    });
    // update stats
    const all = await prisma.review.findMany({ where: { gameId } });
    const avg =
      Math.round((all.reduce((sum, r) => sum + r.rating, 0) / all.length) * 10) / 10;
    await prisma.game.update({
      where: { id: gameId },
      data: { averageRating: avg, reviewCount: all.length },
    });
    res.status(201).json(review);
  } catch (err) {
    handleError(res, err);
  }
});

app.get(
  "/api/reviews/user/:userId?",
  authMiddleware,
  async (req: Request, res) => {
    try {
      const targetId = req.params.userId || req.user!.id;
      if (targetId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const reviews = await prisma.review.findMany({
        where: { userId: targetId },
        orderBy: { createdAt: "desc" },
        include: {
          game: { select: { id: true, title: true, coverImage: true, genre: true } },
        },
      });
      res.json(reviews);
    } catch (err) {
      handleError(res, err);
    }
  }
);

app.get("/api/reviews/:id", async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        game: { select: { id: true, title: true, coverImage: true } },
      },
    });
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    handleError(res, err);
  }
});

app.put("/api/reviews/:id", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const orig = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!orig) return res.status(404).json({ error: "Review not found" });
    if (orig.userId !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Cannot edit someone else's review" });
    }
    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: { rating, comment },
    });
    // recalc stats
    const all = await prisma.review.findMany({ where: { gameId: orig.gameId } });
    const avg =
      Math.round((all.reduce((sum, r) => sum + r.rating, 0) / all.length) * 10) / 10;
    await prisma.game.update({
      where: { id: orig.gameId },
      data: { averageRating: avg },
    });
    res.json(updated);
  } catch (err) {
    handleError(res, err);
  }
});

app.delete("/api/reviews/:id", authMiddleware, async (req, res) => {
  try {
    const orig = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!orig) return res.status(404).json({ error: "Review not found" });
    if (orig.userId !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Cannot delete someone else's review" });
    }
    await prisma.review.delete({ where: { id: req.params.id } });
    const all = await prisma.review.findMany({ where: { gameId: orig.gameId } });
    const avg =
      all.length > 0
        ? Math.round((all.reduce((sum, r) => sum + r.rating, 0) / all.length) * 10) / 10
        : 0;
    await prisma.game.update({
      where: { id: orig.gameId },
      data: { averageRating: avg, reviewCount: all.length },
    });
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API server listening on http://localhost:${PORT}/api`);
});
