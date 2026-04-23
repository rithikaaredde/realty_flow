import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getTenantProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { cognitoId: String(req.params.cognitoId) } });
  if (!user || user.role !== "TENANT") {
    res.status(404).json({ error: "Tenant not found" });
    return;
  }
  res.json(user);
};

export const updateTenantProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.update({
    where: { cognitoId: String(req.params.cognitoId) },
    data: { name: req.body.name, email: req.body.email, phoneNumber: req.body.phoneNumber },
  });
  res.json(user);
};
