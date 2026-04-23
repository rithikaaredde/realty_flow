import { ApplicationStatus } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const createSchema = z.object({
  propertyId: z.union([z.number(), z.string()]),
  startDate: z.union([z.string(), z.date()]).optional(),
  endDate: z.union([z.string(), z.date()]).optional(),
});

export const createApplication = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.role !== "TENANT" && req.user?.role !== "MANAGER") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const tenantId = req.user?.cognitoId;
    if (!tenantId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid booking payload" });
      return;
    }

    const propertyId = Number(parsed.data.propertyId);
    if (!Number.isFinite(propertyId)) {
      res.status(400).json({ error: "Invalid propertyId" });
      return;
    }

    if (!parsed.data.startDate || !parsed.data.endDate) {
      const existing = await prisma.application.findFirst({
        where: { tenantId, propertyId },
      });
      if (existing) {
        res
          .status(400)
          .json({ error: "You have already booked this property" });
        return;
      }
      res
        .status(400)
        .json({ error: "Start and end dates are required" });
      return;
    }

    const startDate = new Date(parsed.data.startDate);
    const endDate = new Date(parsed.data.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }

    if (startDate >= endDate) {
      res.status(400).json({ error: "Invalid date range" });
      return;
    }

    // Overlap with existing applications on this property (JSON dates in additionalInfo)
    const existingForProperty = await prisma.application.findMany({
      where: { propertyId },
      select: { additionalInfo: true },
    });

    for (const row of existingForProperty) {
      const info = row.additionalInfo as
        | { startDate?: unknown; endDate?: unknown }
        | null
        | undefined;
      if (!info) continue;
      const existingStart = info.startDate
        ? new Date(info.startDate as string | number | Date)
        : null;
      const existingEnd = info.endDate
        ? new Date(info.endDate as string | number | Date)
        : null;
      if (
        !existingStart ||
        !existingEnd ||
        isNaN(existingStart.getTime()) ||
        isNaN(existingEnd.getTime())
      ) {
        continue;
      }
      if (existingStart <= endDate && existingEnd >= startDate) {
        res
          .status(400)
          .json({ error: "Property already booked for selected dates" });
        return;
      }
    }

    const application = await prisma.application.create({
      data: {
        propertyId,
        tenantId,
        personalInfo: {},
        financialInfo: {},
        additionalInfo: {
          startDate,
          endDate,
        } as any,
      },
    });

    res.status(201).json(application);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error?.message ?? "Failed to create application" });
  }
};

export const listApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const where = {
    ...(req.query.tenantId
      ? { tenantId: String(req.query.tenantId) }
      : {}),
    ...(req.query.propertyId
      ? { propertyId: Number(req.query.propertyId) }
      : {}),
  };

  const total = await prisma.application.count({ where });

  const data = await prisma.application.findMany({
    where,
    include: {
      property: {
        include: {
          location: true,
        },
      },
      tenant: true,
    },
  });

  res.json({ data, total, page: 1, limit: total || 1 });
};

export const listApplicationsByUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = String(req.params.userId);

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.user.role !== "MANAGER" && req.user.cognitoId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const total = await prisma.application.count({
    where: { tenantId: userId },
  });

  const data = await prisma.application.findMany({
    where: { tenantId: userId },
    include: {
      property: { include: { location: true } },
    },
    orderBy: { applicationDate: "desc" },
  });

  res.json({ data, total, page: 1, limit: total || 1 });
};

export const updateApplicationStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (req.user?.role !== "MANAGER") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const status = req.body.status as ApplicationStatus;

  const application = await prisma.application.update({
    where: { id: Number(req.params.id) },
    data: { status },
  });

  res.json(application);
};