"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantProfile = exports.getTenantProfile = void 0;
const prisma_1 = require("../lib/prisma");
const getTenantProfile = async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { cognitoId: String(req.params.cognitoId) } });
    if (!user || user.role !== "TENANT") {
        res.status(404).json({ error: "Tenant not found" });
        return;
    }
    res.json(user);
};
exports.getTenantProfile = getTenantProfile;
const updateTenantProfile = async (req, res) => {
    const user = await prisma_1.prisma.user.update({
        where: { cognitoId: String(req.params.cognitoId) },
        data: { name: req.body.name, email: req.body.email, phoneNumber: req.body.phoneNumber },
    });
    res.json(user);
};
exports.updateTenantProfile = updateTenantProfile;
