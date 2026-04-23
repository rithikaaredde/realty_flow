"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = exports.listPayments = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const createSchema = zod_1.z.object({
    amountDue: zod_1.z.number(),
    amountPaid: zod_1.z.number(),
    dueDate: zod_1.z.string(),
    paymentDate: zod_1.z.string().optional(),
    paymentStatus: zod_1.z.enum(["PENDING", "PAID", "PARTIALLYREFUNDED", "REFUNDED"]).optional(),
    leaseId: zod_1.z.number(),
});
const listPayments = async (req, res) => {
    const where = req.query.leaseId ? { leaseId: Number(req.query.leaseId) } : {};
    const total = await prisma_1.prisma.payment.count({ where });
    const data = await prisma_1.prisma.payment.findMany({ where });
    res.json({ data, total, page: 1, limit: total || 1 });
};
exports.listPayments = listPayments;
const createPayment = async (req, res) => {
    const payload = createSchema.parse(req.body);
    const payment = await prisma_1.prisma.payment.create({
        data: Object.assign(Object.assign({}, payload), { dueDate: new Date(payload.dueDate), paymentDate: payload.paymentDate ? new Date(payload.paymentDate) : null }),
    });
    res.status(201).json(payment);
};
exports.createPayment = createPayment;
