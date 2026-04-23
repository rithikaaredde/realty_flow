"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPropertyApplications = exports.deleteProperty = exports.updateProperty = exports.createProperty = exports.getProperty = exports.listProperties = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const propertySchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    pricePerMonth: zod_1.z.number(),
    securityDeposit: zod_1.z.number(),
    applicationFee: zod_1.z.number(),
    photoUrls: zod_1.z.array(zod_1.z.string()),
    amenities: zod_1.z.array(zod_1.z.string()),
    highlights: zod_1.z.array(zod_1.z.string()),
    isPetsAllowed: zod_1.z.boolean().default(false),
    isParkingIncluded: zod_1.z.boolean().default(false),
    beds: zod_1.z.number(),
    baths: zod_1.z.number(),
    squareFeet: zod_1.z.number(),
    latitude: zod_1.z.number().nullable().optional(),
    longitude: zod_1.z.number().nullable().optional(),
    propertyType: zod_1.z.string(),
    locationId: zod_1.z.number().optional(),
    location: zod_1.z
        .object({
        address: zod_1.z.string(),
        city: zod_1.z.string(),
        state: zod_1.z.string(),
        country: zod_1.z.string(),
        postalCode: zod_1.z.string(),
    })
        .optional(),
});
/* -------------------------- LIST PROPERTIES -------------------------- */
const listProperties = async (req, res) => {
    var _a, _b;
    const { city, vicinity, name, minPrice, maxPrice, beds, baths, propertyType, amenities, isPetsAllowed, sortBy = "postedDate", sortOrder = "desc", limit = "12", offset = "0", } = req.query;
    const petsFilter = isPetsAllowed === "true"
        ? true
        : isPetsAllowed === "false"
            ? false
            : undefined;
    const where = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (city
        ? {
            location: {
                city: { contains: String(city), mode: "insensitive" },
            },
        }
        : {})), (!city && vicinity
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
        : {})), (name
        ? { name: { contains: String(name), mode: "insensitive" } }
        : {})), (minPrice || maxPrice
        ? {
            pricePerMonth: {
                gte: Number(minPrice || 0),
                lte: Number(maxPrice || Number.MAX_SAFE_INTEGER),
            },
        }
        : {})), (beds ? { beds: { gte: Number(beds) } } : {})), (baths ? { baths: { gte: Number(baths) } } : {})), (propertyType ? { propertyType: String(propertyType) } : {})), (amenities
        ? {
            amenities: {
                hasEvery: String(amenities)
                    .split(",")
                    .filter(Boolean),
            },
        }
        : {})), (petsFilter !== undefined ? { isPetsAllowed: petsFilter } : {}));
    const total = await prisma_1.prisma.property.count({ where });
    const data = await prisma_1.prisma.property.findMany({
        where,
        include: { location: true, manager: true },
        orderBy: {
            [String(sortBy)]: sortOrder === "asc" ? "asc" : "desc",
        },
        take: Number(limit),
        skip: Number(offset),
    });
    if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.cognitoId) {
        const fav = await prisma_1.prisma.user.findUnique({
            where: { cognitoId: req.user.cognitoId },
            select: { favorites: { select: { id: true } } },
        });
        const favIds = new Set(((_b = fav === null || fav === void 0 ? void 0 : fav.favorites) !== null && _b !== void 0 ? _b : []).map((p) => p.id));
        res.json({
            data: data.map((p) => (Object.assign(Object.assign({}, p), { isFavorited: favIds.has(p.id) }))),
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
exports.listProperties = listProperties;
/* -------------------------- GET PROPERTY -------------------------- */
const getProperty = async (req, res) => {
    const property = await prisma_1.prisma.property.findUnique({
        where: { id: Number(req.params.id) },
        include: { location: true, manager: true },
    });
    if (!property)
        return void res.status(404).json({ error: "Property not found" });
    res.json(property);
};
exports.getProperty = getProperty;
/* -------------------------- CREATE PROPERTY -------------------------- */
const createProperty = async (req, res) => {
    var _a, _b;
    const rawRole = String((_a = req.headers["x-user-role-raw"]) !== null && _a !== void 0 ? _a : "").toLowerCase();
    if (rawRole !== "owner")
        return void res.status(403).json({ error: "Forbidden" });
    if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.cognitoId))
        return void res.status(401).json({ error: "Unauthorized" });
    const parsed = propertySchema.safeParse(req.body);
    if (!parsed.success) {
        return void res.status(400).json({ error: "Invalid property payload" });
    }
    const payload = parsed.data;
    if (payload.beds <= 0 ||
        payload.baths <= 0 ||
        payload.squareFeet <= 0 ||
        !Array.isArray(payload.amenities)) {
        return void res.status(400).json({
            error: "Missing or invalid critical property fields",
        });
    }
    let locationId = payload.locationId;
    if (!locationId && payload.location) {
        const existingLocation = await prisma_1.prisma.location.findFirst({
            where: {
                city: payload.location.city,
            },
        });
        if (existingLocation) {
            locationId = existingLocation.id;
        }
        else {
            const newLocation = await prisma_1.prisma.location.create({
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
    const { location } = payload, rest = __rest(payload, ["location"]);
    const property = await prisma_1.prisma.property.create({
        data: Object.assign(Object.assign({}, rest), { locationId, managerId: req.user.cognitoId }),
    });
    res.status(201).json(property);
};
exports.createProperty = createProperty;
/* -------------------------- UPDATE PROPERTY -------------------------- */
const updateProperty = async (req, res) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "MANAGER")
        return void res.status(403).json({ error: "Forbidden" });
    const existing = await prisma_1.prisma.property.findUnique({
        where: { id: Number(req.params.id) },
    });
    if (!existing || existing.managerId !== req.user.cognitoId) {
        return void res.status(403).json({ error: "Not owner" });
    }
    const partial = propertySchema.partial().parse(req.body);
    let locationId = partial.locationId;
    if (!locationId && partial.location) {
        const existingLocation = await prisma_1.prisma.location.findFirst({
            where: {
                city: partial.location.city,
            },
        });
        if (existingLocation) {
            locationId = existingLocation.id;
        }
        else {
            const newLocation = await prisma_1.prisma.location.create({
                data: partial.location,
            });
            locationId = newLocation.id;
        }
    }
    const { location } = partial, rest = __rest(partial, ["location"]);
    const property = await prisma_1.prisma.property.update({
        where: { id: Number(req.params.id) },
        data: Object.assign(Object.assign({}, rest), (locationId ? { locationId } : {})),
    });
    res.json(property);
};
exports.updateProperty = updateProperty;
/* -------------------------- DELETE PROPERTY -------------------------- */
const deleteProperty = async (req, res) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "MANAGER")
        return void res.status(403).json({ error: "Forbidden" });
    const existing = await prisma_1.prisma.property.findUnique({
        where: { id: Number(req.params.id) },
    });
    if (!existing || existing.managerId !== req.user.cognitoId) {
        return void res.status(403).json({ error: "Not owner" });
    }
    await prisma_1.prisma.property.delete({
        where: { id: Number(req.params.id) },
    });
    res.status(204).send();
};
exports.deleteProperty = deleteProperty;
/* -------------------------- APPLICATIONS -------------------------- */
const listPropertyApplications = async (req, res) => {
    const propertyId = Number(req.params.id);
    const total = await prisma_1.prisma.application.count({
        where: { propertyId },
    });
    const data = await prisma_1.prisma.application.findMany({
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
exports.listPropertyApplications = listPropertyApplications;
