"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaseController_1 = require("../controllers/leaseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.authenticate, leaseController_1.listLeases);
router.get("/:id", authMiddleware_1.authenticate, leaseController_1.getLease);
exports.default = router;
