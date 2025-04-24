// backend/src/routes/tagRoutes.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export function createTagRouter(prisma: PrismaClient) {
  const router = express.Router();
  
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const tags = await prisma.tag.findMany();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  });
  
  return router;
}
