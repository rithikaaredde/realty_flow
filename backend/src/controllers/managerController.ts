import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getManagerProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { cognitoId: String(req.params.cognitoId) } });
  if (!user || user.role !== "MANAGER") {
    res.status(404).json({ error: "Manager not found" });
    return;
  }
  res.json(user);
};

export const updateManagerProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.update({
    where: { cognitoId: String(req.params.cognitoId) },
    data: { name: req.body.name, email: req.body.email, phoneNumber: req.body.phoneNumber },
  });
  res.json(user);
};

export const getManagerProperties = async (req: Request, res: Response): Promise<void> => {
  const data = await prisma.property.findMany({
    where: { managerId: String(req.params.cognitoId) },
    include: { location: true },
  });
  res.json({ data, total: data.length, page: 1, limit: data.length || 1 });
};
