"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUser = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const syncUser = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const cognitoId = String((_a = req.headers["x-user-id"]) !== null && _a !== void 0 ? _a : "");
        const headerRole = String((_b = req.headers["x-user-role"]) !== null && _b !== void 0 ? _b : "");
        const rawRole = String((_c = req.headers["x-user-role-raw"]) !== null && _c !== void 0 ? _c : "");
        const { email, name } = ((_d = req.body) !== null && _d !== void 0 ? _d : {});
        if (!cognitoId) {
            res.status(400).json({ error: "Missing x-user-id" });
            return;
        }
        const existing = await prisma_1.prisma.user.findUnique({ where: { cognitoId } });
        if (existing) {
            // If Cognito provides fresher identity fields later, update them safely.
            if ((email && email !== existing.email) || (name && name !== existing.name)) {
                const updated = await prisma_1.prisma.user.update({
                    where: { cognitoId },
                    data: Object.assign(Object.assign({}, (email ? { email } : {})), (name ? { name } : {})),
                });
                res.json(updated);
                return;
            }
            res.json(existing);
            return;
        }
        const isAdmin = rawRole === "admin" ||
            rawRole === "owner" ||
            headerRole === "admin" ||
            headerRole === "MANAGER" ||
            headerRole === "OWNER";
        const user = await prisma_1.prisma.user.create({
            data: {
                cognitoId,
                email: email !== null && email !== void 0 ? email : `${cognitoId}@cognito.local`,
                name: name !== null && name !== void 0 ? name : "User",
                role: isAdmin ? client_1.Role.MANAGER : client_1.Role.TENANT,
            },
        });
        res.json(user);
    }
    catch (_e) {
        res.status(500).json({ error: "Failed to sync user" });
    }
};
exports.syncUser = syncUser;
