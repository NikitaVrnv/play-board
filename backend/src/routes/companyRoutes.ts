// backend/src/routes/companyRoutes.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export function createCompanyRouter(prisma: PrismaClient) {
  const router = express.Router();
  
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const companies = await prisma.company.findMany();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.params.id }
      });
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch company' });
    }
  });
  
  return router;
}
