"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationStatus = exports.listApplicationsByUser = exports.listApplications = exports.createApplication = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const createSchema = zod_1.z.object({
    propertyId: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]),
    startDate: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional(),
    endDate: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional(),
});
const createApplication = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "TENANT" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "MANAGER") {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        const tenantId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.cognitoId;
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
            const existing = await prisma_1.prisma.application.findFirst({
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
        const existingForProperty = await prisma_1.prisma.application.findMany({
            where: { propertyId },
            select: { additionalInfo: true },
        });
        for (const row of existingForProperty) {
            const info = row.additionalInfo;
            if (!info)
                continue;
            const existingStart = info.startDate
                ? new Date(info.startDate)
                : null;
            const existingEnd = info.endDate
                ? new Date(info.endDate)
                : null;
            if (!existingStart ||
                !existingEnd ||
                isNaN(existingStart.getTime()) ||
                isNaN(existingEnd.getTime())) {
                continue;
            }
            if (existingStart <= endDate && existingEnd >= startDate) {
                res
                    .status(400)
                    .json({ error: "Property already booked for selected dates" });
                return;
            }
        }
        const application = await prisma_1.prisma.application.create({
            data: {
                propertyId,
                tenantId,
                personalInfo: {},
                financialInfo: {},
                additionalInfo: {
                    startDate,
                    endDate,
                },
            },
        });
        res.status(201).json(application);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: (_d = error === null || error === void 0 ? void 0 : error.message) !== null && _d !== void 0 ? _d : "Failed to create application" });
    }
};
exports.createApplication = createApplication;
const listApplications = async (req, res) => {
    const where = Object.assign(Object.assign({}, (req.query.tenantId
        ? { tenantId: String(req.query.tenantId) }
        : {})), (req.query.propertyId
        ? { propertyId: Number(req.query.propertyId) }
        : {}));
    const total = await prisma_1.prisma.application.count({ where });
    const data = await prisma_1.prisma.application.findMany({
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
exports.listApplications = listApplications;
const listApplicationsByUser = async (req, res) => {
    const userId = String(req.params.userId);
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    if (req.user.role !== "MANAGER" && req.user.cognitoId !== userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    const total = await prisma_1.prisma.application.count({
        where: { tenantId: userId },
    });
    const data = await prisma_1.prisma.application.findMany({
        where: { tenantId: userId },
        include: {
            property: { include: { location: true } },
        },
        orderBy: { applicationDate: "desc" },
    });
    res.json({ data, total, page: 1, limit: total || 1 });
};
exports.listApplicationsByUser = listApplicationsByUser;
const updateApplicationStatus = async (req, res) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "MANAGER") {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    const status = req.body.status;
    const application = await prisma_1.prisma.application.update({
        where: { id: Number(req.params.id) },
        data: { status },
    });
    res.json(application);
};
exports.updateApplicationStatus = updateApplicationStatus;
