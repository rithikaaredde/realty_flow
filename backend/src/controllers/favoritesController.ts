import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const addFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    const normalizedUserId = String(cognitoId);
    const parsedPropertyId = Number(propertyId);
    if (Number.isNaN(parsedPropertyId)) {
      res.status(400).json({ error: "Invalid propertyId" });
      return;
    }

    const [user, property] = await Promise.all([
      prisma.user.findUnique({
        where: { cognitoId: normalizedUserId },
        include: { favorites: { select: { id: true } } },
      }),
      prisma.property.findUnique({ where: { id: parsedPropertyId } }),
    ]);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    const alreadyFavorited = user.favorites.some((favorite) => favorite.id === parsedPropertyId);
    if (alreadyFavorited) {
      const existingUser = await prisma.user.findUnique({
        where: { cognitoId: normalizedUserId },
        include: { favorites: { include: { location: true } } },
      });
      res.json(existingUser?.favorites || []);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { cognitoId: normalizedUserId },
      data: { favorites: { connect: { id: parsedPropertyId } } },
      include: { favorites: { include: { location: true } } },
    });
    res.json(updatedUser.favorites);
  } catch (error) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
};

export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    const normalizedUserId = String(cognitoId);
    const parsedPropertyId = Number(propertyId);
    if (Number.isNaN(parsedPropertyId)) {
      res.status(400).json({ error: "Invalid propertyId" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { cognitoId: normalizedUserId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { cognitoId: normalizedUserId },
      data: { favorites: { disconnect: { id: parsedPropertyId } } },
      include: { favorites: { include: { location: true } } },
    });
    res.json(updatedUser.favorites);
  } catch (error) {
    res.status(500).json({ error: "Failed to remove favorite" });
  }
};

export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const user = await prisma.user.findUnique({
      where: { cognitoId: String(cognitoId) },
      include: { favorites: { include: { location: true } } },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    const normalizedUserId = String(cognitoId);
    const parsedPropertyId = Number(propertyId);
    if (Number.isNaN(parsedPropertyId)) {
      res.status(400).json({ error: "Invalid propertyId" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { cognitoId: normalizedUserId },
      include: { favorites: { select: { id: true } } },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isFavorited = user.favorites.some((favorite) => favorite.id === parsedPropertyId);
    const updated = await prisma.user.update({
      where: { cognitoId: normalizedUserId },
      data: {
        favorites: isFavorited
          ? { disconnect: { id: parsedPropertyId } }
          : { connect: { id: parsedPropertyId } },
      },
      include: { favorites: { include: { location: true } } },
    });

    res.json({
      favorited: !isFavorited,
      favorites: updated.favorites,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
};
