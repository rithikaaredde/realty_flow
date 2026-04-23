import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const propertySchema = z.object({
  name: z.string(),
  description: z.string(),
  pricePerMonth: z.number(),
  securityDeposit: z.number(),
  applicationFee: z.number(),
  photoUrls: z.array(z.string()),
  amenities: z.array(z.string()),
  highlights: z.array(z.string()),
  isPetsAllowed: z.boolean().default(false),
  isParkingIncluded: z.boolean().default(false),
  beds: z.number(),
  baths: z.number(),
  squareFeet: z.number(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  propertyType: z.string(),
  locationId: z.number().optional(),
  location: z
    .object({
      address: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      postalCode: z.string(),
    })
    .optional(),
});

/* -------------------------- LIST PROPERTIES -------------------------- */
export const listProperties = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const {
    city,
    vicinity,
    name,
    minPrice,
    maxPrice,
    beds,
    baths,
    propertyType,
    amenities,
    isPetsAllowed,
    sortBy = "postedDate",
    sortOrder = "desc",
    limit = "12",
    offset = "0",
  } = req.query;

  const petsFilter =
    isPetsAllowed === "true"
      ? true
      : isPetsAllowed === "false"
      ? false
      : undefined;

  const where: Prisma.PropertyWhereInput = {
    ...(city
      ? {
          location: {
            city: { contains: String(city), mode: "insensitive" },
          },
        }
      : {}),
    ...(!city && vicinity
      ? {
          OR: [
            {
              location: {
                city: { contains: String(vicinity), mode: "insensitive" },
              },
            },
            {
              location: {
                address: {
                  contains: String(vicinity),
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
    ...(name
      ? { name: { contains: String(name), mode: "insensitive" } }
      : {}),
    ...(minPrice || maxPrice
      ? {
          pricePerMonth: {
            gte: Number(minPrice || 0),
            lte: Number(maxPrice || Number.MAX_SAFE_INTEGER),
          },
        }
      : {}),
    ...(beds ? { beds: { gte: Number(beds) } } : {}),
    ...(baths ? { baths: { gte: Number(baths) } } : {}),
    ...(propertyType ? { propertyType: String(propertyType) as any } : {}),
    ...(amenities
      ? {
          amenities: {
            hasEvery: String(amenities)
              .split(",")
              .filter(Boolean) as any,
          },
        }
      : {}),
    ...(petsFilter !== undefined ? { isPetsAllowed: petsFilter } : {}),
  };

  const total = await prisma.property.count({ where });

  const data = await prisma.property.findMany({
    where,
    include: { location: true, manager: true },
    orderBy: {
      [String(sortBy)]: sortOrder === "asc" ? "asc" : "desc",
    },
    take: Number(limit),
    skip: Number(offset),
  });

  if (req.user?.cognitoId) {
    const fav = await prisma.user.findUnique({
      where: { cognitoId: req.user.cognitoId },
      select: { favorites: { select: { id: true } } },
    });

    const favIds = new Set(
      (fav?.favorites ?? []).map((p) => p.id)
    );

    res.json({
      data: data.map((p: any) => ({
        ...p,
        isFavorited: favIds.has(p.id),
      })),
      total,
      page: Math.floor(Number(offset) / Number(limit)) + 1,
      limit: Number(limit),
    });
    return;
  }

  res.json({
    data,
    total,
    page: Math.floor(Number(offset) / Number(limit)) + 1,
    limit: Number(limit),
  });
};

/* -------------------------- GET PROPERTY -------------------------- */
export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  const property = await prisma.property.findUnique({
    where: { id: Number(req.params.id) },
    include: { location: true, manager: true },
  });

  if (!property)
    return void res.status(404).json({ error: "Property not found" });

  res.json(property);
};

/* -------------------------- CREATE PROPERTY -------------------------- */
export const createProperty = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const rawRole = String(
    req.headers["x-user-role-raw"] ?? ""
  ).toLowerCase();

  if (rawRole !== "owner")
    return void res.status(403).json({ error: "Forbidden" });

  if (!req.user?.cognitoId)
    return void res.status(401).json({ error: "Unauthorized" });

  const parsed = propertySchema.safeParse(req.body);
  if (!parsed.success) {
    return void res.status(400).json({ error: "Invalid property payload" });
  }
  const payload = parsed.data;

  if (
    payload.beds <= 0 ||
    payload.baths <= 0 ||
    payload.squareFeet <= 0 ||
    !Array.isArray(payload.amenities)
  ) {
    return void res.status(400).json({
      error: "Missing or invalid critical property fields",
    });
  }

  let locationId = payload.locationId;

  if (!locationId && payload.location) {
    const existingLocation = await prisma.location.findFirst({
      where: {
        city: payload.location.city,
      },
    });

    if (existingLocation) {
      locationId = existingLocation.id;
    } else {
      const newLocation = await prisma.location.create({
        data: payload.location,
      });
      locationId = newLocation.id;
    }
  }

  if (!locationId) {
    return void res
      .status(400)
      .json({ error: "Missing location information" });
  }

  const { location, ...rest } = payload;

  const property = await prisma.property.create({
    data: {
      ...rest,
      locationId,
      managerId: req.user.cognitoId,
    } as any,
  });

  res.status(201).json(property);
};

/* -------------------------- UPDATE PROPERTY -------------------------- */
export const updateProperty = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (req.user?.role !== "MANAGER")
    return void res.status(403).json({ error: "Forbidden" });

  const existing = await prisma.property.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!existing || existing.managerId !== req.user.cognitoId) {
    return void res.status(403).json({ error: "Not owner" });
  }

  const partial = propertySchema.partial().parse(req.body);

  let locationId = partial.locationId;

  if (!locationId && partial.location) {
    const existingLocation = await prisma.location.findFirst({
      where: {
        city: partial.location.city,
      },
    });

    if (existingLocation) {
      locationId = existingLocation.id;
    } else {
      const newLocation = await prisma.location.create({
        data: partial.location as any,
      });
      locationId = newLocation.id;
    }
  }

  const { location, ...rest } = partial;

  const property = await prisma.property.update({
    where: { id: Number(req.params.id) },
    data: {
      ...rest,
      ...(locationId ? { locationId } : {}),
    } as any,
  });

  res.json(property);
};

/* -------------------------- DELETE PROPERTY -------------------------- */
export const deleteProperty = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (req.user?.role !== "MANAGER")
    return void res.status(403).json({ error: "Forbidden" });

  const existing = await prisma.property.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!existing || existing.managerId !== req.user.cognitoId) {
    return void res.status(403).json({ error: "Not owner" });
  }

  await prisma.property.delete({
    where: { id: Number(req.params.id) },
  });

  res.status(204).send();
};

/* -------------------------- APPLICATIONS -------------------------- */
export const listPropertyApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const propertyId = Number(req.params.id);

  const total = await prisma.application.count({
    where: { propertyId },
  });

  const data = await prisma.application.findMany({
    where: { propertyId },
    include: { tenant: true },
  });

  res.json({
    data,
    total,
    page: 1,
    limit: total || 1,
  });
};