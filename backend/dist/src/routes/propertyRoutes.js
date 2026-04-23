"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyController_1 = require("../controllers/propertyController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", propertyController_1.listProperties);
router.get("/:id", propertyController_1.getProperty);
router.post("/", authMiddleware_1.authenticate, (req, res, next) => {
    var _a;
    const raw = String((_a = req.headers["x-user-role-raw"]) !== null && _a !== void 0 ? _a : "").toLowerCase();
    if (raw !== "owner") {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    next();
}, propertyController_1.createProperty);
router.put("/:id", authMiddleware_1.authenticate, propertyController_1.updateProperty);
router.delete("/:id", authMiddleware_1.authenticate, propertyController_1.deleteProperty);
router.get("/:id/applications", authMiddleware_1.authenticate, propertyController_1.listPropertyApplications);
exports.default = router;
