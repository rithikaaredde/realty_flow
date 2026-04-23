import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getFavoritesByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = String(req.params.userId);
    const user = await prisma.user.findUnique({
      where: { cognitoId: userId },
      include: { favorites: { include: { location: true } } },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ data: user.favorites });
  } catch {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

export const addFavoriteFromBody = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = String(req.body?.userId ?? "");
    const propertyId = Number(req.body?.propertyId);

    if (!userId) {
      res.status(400).json({ error: "Missing userId" });
      return;
    }
    if (Number.isNaN(propertyId)) {
      res.status(400).json({ error: "Invalid propertyId" });
      return;
    }

    const [user, property] = await Promise.all([
      prisma.user.findUnique({
        where: { cognitoId: userId },
        include: { favorites: { select: { id: true } } },
      }),
      prisma.property.findUnique({ where: { id: propertyId } }),
    ]);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    const already = user.favorites.some((f) => f.id === propertyId);
    if (already) {
      const existing = await prisma.user.findUnique({
        where: { cognitoId: userId },
        include: { favorites: { include: { location: true } } },
      });
      res.json({ data: existing?.favorites ?? [] });
      return;
    }

    const updated = await prisma.user.update({
      where: { cognitoId: userId },
      data: { favorites: { connect: { id: propertyId } } },
      include: { favorites: { include: { location: true } } },
    });

    res.json({ data: updated.favorites });
  } catch {
    res.status(500).json({ error: "Failed to add favorite" });
  }
};

export const removeFavoriteByUserAndProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = String(req.params.userId);
    const propertyId = Number(req.params.propertyId);

    if (Number.isNaN(propertyId)) {
      res.status(400).json({ error: "Invalid propertyId" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { cognitoId: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const updated = await prisma.user.update({
      where: { cognitoId: userId },
      data: { favorites: { disconnect: { id: propertyId } } },
      include: { favorites: { include: { location: true } } },
    });

    res.json({ data: updated.favorites });
  } catch {
    res.status(500).json({ error: "Failed to remove favorite" });
  }
};

