import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const listLeases = async (req: Request, res: Response): Promise<void> => {
  const where = {
    ...(req.query.tenantId ? { tenantId: String(req.query.tenantId) } : {}),
    ...(req.query.propertyId ? { propertyId: Number(req.query.propertyId) } : {}),
  };
  const total = await prisma.lease.count({ where });
  const data = await prisma.lease.findMany({ where, include: { property: true, tenant: true } });
  res.json({ data, total, page: 1, limit: total || 1 });
};

export const getLease = async (req: Request, res: Response): Promise<void> => {
  const lease = await prisma.lease.findUnique({
    where: { id: Number(req.params.id) },
    include: { payments: true, property: true, tenant: true },
  });
  if (!lease) {
    res.status(404).json({ error: "Lease not found" });
    return;
  }
  res.json(lease);
};
