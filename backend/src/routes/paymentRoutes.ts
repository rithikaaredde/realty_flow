import { Router } from "express";
import { createPayment, listPayments } from "../controllers/paymentController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();
router.get("/", authenticate, listPayments);
router.post("/", authenticate, createPayment);
export default router;
