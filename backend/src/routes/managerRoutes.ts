import { Router } from "express";
import {
  getManagerProfile,
  getManagerProperties,
  updateManagerProfile,
} from "../controllers/managerController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();
router.get("/:cognitoId", authenticate, getManagerProfile);
router.put("/:cognitoId", authenticate, updateManagerProfile);
router.get("/:cognitoId/properties", authenticate, getManagerProperties);
export default router;
