import { Router } from "express";
import { getLease, listLeases } from "../controllers/leaseController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();
router.get("/", authenticate, listLeases);
router.get("/:id", authenticate, getLease);
export default router;
