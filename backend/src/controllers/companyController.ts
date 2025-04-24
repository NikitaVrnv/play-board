import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getAllCompanies(req: Request, res: Response) {
  const list = await prisma.company.findMany();
  res.json(list);
}

export async function getCompanyById(req: Request, res: Response) {
  const { id } = req.params;
  const c = await prisma.company.findUnique({ where: { id } });
  if (!c) return res.status(404).json({ error: "Not found" });
  res.json(c);
}

export async function createCompany(req: Request, res: Response) {
  const data = req.body;
  const c = await prisma.company.create({ data });
  res.status(201).json(c);
}

export async function updateCompany(req: Request, res: Response) {
  const { id } = req.params;
  const data = req.body;
  try {
    const c = await prisma.company.update({ where: { id }, data });
    res.json(c);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
}

export async function deleteCompany(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.company.delete({ where: { id } });
  res.status(204).end();
}
