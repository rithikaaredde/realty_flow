"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLease = exports.listLeases = void 0;
const prisma_1 = require("../lib/prisma");
const listLeases = async (req, res) => {
    const where = Object.assign(Object.assign({}, (req.query.tenantId ? { tenantId: String(req.query.tenantId) } : {})), (req.query.propertyId ? { propertyId: Number(req.query.propertyId) } : {}));
    const total = await prisma_1.prisma.lease.count({ where });
    const data = await prisma_1.prisma.lease.findMany({ where, include: { property: true, tenant: true } });
    res.json({ data, total, page: 1, limit: total || 1 });
};
exports.listLeases = listLeases;
const getLease = async (req, res) => {
    const lease = await prisma_1.prisma.lease.findUnique({
        where: { id: Number(req.params.id) },
        include: { payments: true, property: true, tenant: true },
    });
    if (!lease) {
        res.status(404).json({ error: "Lease not found" });
        return;
    }
    res.json(lease);
};
exports.getLease = getLease;
