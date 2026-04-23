"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
// ✅ THIS NAME FIXES EVERYTHING
const authenticate = (req, _res, next) => {
    var _a;
    const userId = req.headers["x-user-id"];
    const rawRole = String((_a = req.headers["x-user-role"]) !== null && _a !== void 0 ? _a : "").toUpperCase();
    const role = rawRole === "MANAGER" || rawRole === "ADMIN" || rawRole === "OWNER"
        ? "MANAGER"
        : rawRole === "TENANT" || rawRole === "USER"
            ? "TENANT"
            : undefined;
    if (userId && role) {
        req.user = { cognitoId: userId, role };
    }
    next();
};
exports.authenticate = authenticate;
