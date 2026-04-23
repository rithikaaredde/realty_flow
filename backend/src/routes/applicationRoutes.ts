import { Router } from "express";
import {
  createApplication,
  listApplications,
  listApplicationsByUser,
  updateApplicationStatus,
} from "../controllers/applicationController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();
router.get("/", authenticate, listApplications);
router.get("/user/:userId", authenticate, listApplicationsByUser);
router.post("/", authenticate, createApplication);
router.put("/:id/status", authenticate, updateApplicationStatus);
export default router;
