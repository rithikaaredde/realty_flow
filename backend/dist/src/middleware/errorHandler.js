"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error((err === null || err === void 0 ? void 0 : err.stack) || err);
    if ((err === null || err === void 0 ? void 0 : err.name) === "PrismaClientKnownRequestError") {
        if (err.code === "P2025") {
            res.status(404).json({ error: "Record not found" });
            return;
        }
        if (err.code === "P2002") {
            res.status(409).json({ error: "Duplicate record" });
            return;
        }
    }
    if ((err === null || err === void 0 ? void 0 : err.name) === "ValidationError") {
        res.status(400).json({ error: err.message });
        return;
    }
    res.status((err === null || err === void 0 ? void 0 : err.status) || 500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Internal server error" });
};
exports.errorHandler = errorHandler;
