"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManagerProperties = exports.updateManagerProfile = exports.getManagerProfile = void 0;
const prisma_1 = require("../lib/prisma");
const getManagerProfile = async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { cognitoId: String(req.params.cognitoId) } });
    if (!user || user.role !== "MANAGER") {
        res.status(404).json({ error: "Manager not found" });
        return;
    }
    res.json(user);
};
exports.getManagerProfile = getManagerProfile;
const updateManagerProfile = async (req, res) => {
    const user = await prisma_1.prisma.user.update({
        where: { cognitoId: String(req.params.cognitoId) },
        data: { name: req.body.name, email: req.body.email, phoneNumber: req.body.phoneNumber },
    });
    res.json(user);
};
exports.updateManagerProfile = updateManagerProfile;
const getManagerProperties = async (req, res) => {
    const data = await prisma_1.prisma.property.findMany({
        where: { managerId: String(req.params.cognitoId) },
        include: { location: true },
    });
    res.json({ data, total: data.length, page: 1, limit: data.length || 1 });
};
exports.getManagerProperties = getManagerProperties;
