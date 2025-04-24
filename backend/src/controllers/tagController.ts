import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getAllTags(req: Request, res: Response) {
  const list = await prisma.tag.findMany();
  res.json(list);
}

export async function getTagById(req: Request, res: Response) {
  const { id } = req.params;
  const t = await prisma.tag.findUnique({ where: { id } });
  if (!t) return res.status(404).json({ error: "Not found" });
  res.json(t);
}

export async function createTag(req: Request, res: Response) {
  const data = req.body;
  const t = await prisma.tag.create({ data });
  res.status(201).json(t);
}

export async function updateTag(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const t = await prisma.tag.update({ where: { id }, data: req.body });
    res.json(t);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
}

export async function deleteTag(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.tag.delete({ where: { id } });
  res.status(204).end();
}
