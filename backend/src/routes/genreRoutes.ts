// src/routes/genreRoutes.ts
import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json([
    "Action", "Adventure", "RPG", "Strategy", "Simulation",
    "Sports", "Puzzle", "Shooter", "Platformer", "Horror",
    "Racing", "Fighting", "Educational", "Sandbox", "Other",
  ]);
});

export default router;