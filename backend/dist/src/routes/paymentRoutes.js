"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.authenticate, paymentController_1.listPayments);
router.post("/", authMiddleware_1.authenticate, paymentController_1.createPayment);
exports.default = router;
