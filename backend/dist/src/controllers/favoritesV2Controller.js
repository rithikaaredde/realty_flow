"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFavoriteByUserAndProperty = exports.addFavoriteFromBody = exports.getFavoritesByUser = void 0;
const prisma_1 = require("../lib/prisma");
const getFavoritesByUser = async (req, res) => {
    try {
        const userId = String(req.params.userId);
        const user = await prisma_1.prisma.user.findUnique({
            where: { cognitoId: userId },
            include: { favorites: { include: { location: true } } },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ data: user.favorites });
    }
    catch (_a) {
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
};
exports.getFavoritesByUser = getFavoritesByUser;
const addFavoriteFromBody = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const userId = String((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : "");
        const propertyId = Number((_c = req.body) === null || _c === void 0 ? void 0 : _c.propertyId);
        if (!userId) {
            res.status(400).json({ error: "Missing userId" });
            return;
        }
        if (Number.isNaN(propertyId)) {
            res.status(400).json({ error: "Invalid propertyId" });
            return;
        }
        const [user, property] = await Promise.all([
            prisma_1.prisma.user.findUnique({
                where: { cognitoId: userId },
                include: { favorites: { select: { id: true } } },
            }),
            prisma_1.prisma.property.findUnique({ where: { id: propertyId } }),
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
            const existing = await prisma_1.prisma.user.findUnique({
                where: { cognitoId: userId },
                include: { favorites: { include: { location: true } } },
            });
            res.json({ data: (_d = existing === null || existing === void 0 ? void 0 : existing.favorites) !== null && _d !== void 0 ? _d : [] });
            return;
        }
        const updated = await prisma_1.prisma.user.update({
            where: { cognitoId: userId },
            data: { favorites: { connect: { id: propertyId } } },
            include: { favorites: { include: { location: true } } },
        });
        res.json({ data: updated.favorites });
    }
    catch (_e) {
        res.status(500).json({ error: "Failed to add favorite" });
    }
};
exports.addFavoriteFromBody = addFavoriteFromBody;
const removeFavoriteByUserAndProperty = async (req, res) => {
    try {
        const userId = String(req.params.userId);
        const propertyId = Number(req.params.propertyId);
        if (Number.isNaN(propertyId)) {
            res.status(400).json({ error: "Invalid propertyId" });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { cognitoId: userId } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const updated = await prisma_1.prisma.user.update({
            where: { cognitoId: userId },
            data: { favorites: { disconnect: { id: propertyId } } },
            include: { favorites: { include: { location: true } } },
        });
        res.json({ data: updated.favorites });
    }
    catch (_a) {
        res.status(500).json({ error: "Failed to remove favorite" });
    }
};
exports.removeFavoriteByUserAndProperty = removeFavoriteByUserAndProperty;
