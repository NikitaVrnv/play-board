import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors({ 
  origin: "*", // Allow all origins in development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// 🔁 Health check route
app.get("/api/test", (_req, res) => res.json({ ok: true }));

// Import and mount routers
try {
  const authRoutes = require("./routes/authRoutes").default;
  app.use("/api/auth", authRoutes);
  console.log("✓ authRoutes mounted");
} catch (error) {
  console.error("❌ Error loading authRoutes:", error);
}

try {
  const { createAdminRouter } = require("./routes/adminRoutes");
  app.use("/api/admin", createAdminRouter(prisma));
  console.log("✓ adminRoutes mounted");
} catch (error) {
  console.error("❌ Error loading adminRoutes:", error);
}

try {
  const { createGameRouter } = require("./routes/gameRoutes");
  app.use("/api/games", createGameRouter(prisma));
  console.log("✓ gameRoutes mounted");
} catch (error) {
  console.error("❌ Error loading gameRoutes:", error);
}

try {
  const { createReviewRouter } = require("./routes/reviewRoutes");
  app.use("/api/reviews", createReviewRouter(prisma));
  console.log("✓ reviewRoutes mounted");
} catch (error) {
  console.error("❌ Error loading reviewRoutes:", error);
}

try {
  const { createCompanyRouter } = require("./routes/companyRoutes");
  app.use("/api/companies", createCompanyRouter(prisma));
  console.log("✓ companyRoutes mounted");
} catch (error) {
  console.error("❌ Error loading companyRoutes:", error);
}

try {
  const { createTagRouter } = require("./routes/tagRoutes");
  app.use("/api/tags", createTagRouter(prisma));
  console.log("✓ tagRoutes mounted");
} catch (error) {
  console.error("❌ Error loading tagRoutes:", error);
}

try {
  const genreRoutes = require("./routes/genreRoutes").default;
  app.use("/api/genres", genreRoutes);
  console.log("✓ genreRoutes mounted");
} catch (error) {
  console.error("❌ Error loading genreRoutes:", error);
  // Fallback: create the router directly if loading fails
  const fallbackRoutes = express.Router();
  fallbackRoutes.get('/', (_req, res) => {
    res.json([
      "Action", "Adventure", "RPG", "Strategy", "Simulation",
      "Sports", "Puzzle", "Shooter", "Platformer", "Horror",
      "Racing", "Fighting", "Educational", "Sandbox", "Other",
    ]);
  });
  app.use("/api/genres", fallbackRoutes);
  console.log("✓ genreRoutes mounted (fallback)");
}

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌", err);
  res.status(500).json({ error: err.message || "Internal error" });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend on http://localhost:${PORT}`);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log('Received kill signal, shutting down gracefully');
  server.close(() => {
    console.log('Closed out remaining connections');
    prisma.$disconnect();
    process.exit(0);
  });

  // If server hasn't finished in 10s, shut down forcefully
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);