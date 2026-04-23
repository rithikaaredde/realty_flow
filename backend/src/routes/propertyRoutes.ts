import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getProperty,
  listProperties,
  listPropertyApplications,
  updateProperty,
} from "../controllers/propertyController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();
router.get("/", listProperties);
router.get("/:id", getProperty);
router.post(
  "/",
  authenticate,
  (req, res, next) => {
    const raw = String(req.headers["x-user-role-raw"] ?? "").toLowerCase();
    if (raw !== "owner") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  },
  createProperty
);
router.put("/:id", authenticate, updateProperty);
router.delete("/:id", authenticate, deleteProperty);
router.get("/:id/applications", authenticate, listPropertyApplications);
export default router;
