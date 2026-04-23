import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createSchema = z.object({
  amountDue: z.number(),
  amountPaid: z.number(),
  dueDate: z.string(),
  paymentDate: z.string().optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "PARTIALLYREFUNDED", "REFUNDED"]).optional(),
  leaseId: z.number(),
});

export const listPayments = async (req: Request, res: Response): Promise<void> => {
  const where = req.query.leaseId ? { leaseId: Number(req.query.leaseId) } : {};
  const total = await prisma.payment.count({ where });
  const data = await prisma.payment.findMany({ where });
  res.json({ data, total, page: 1, limit: total || 1 });
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  const payload = createSchema.parse(req.body);
  const payment = await prisma.payment.create({
    data: {
      ...payload,
      dueDate: new Date(payload.dueDate),
      paymentDate: payload.paymentDate ? new Date(payload.paymentDate) : null,
    },
  });
  res.status(201).json(payment);
};
