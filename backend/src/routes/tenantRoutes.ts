import { Router } from "express";
import {
  getTenantProfile,
  updateTenantProfile,
} from "../controllers/tenantController";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../controllers/favoritesController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();
router.get("/:cognitoId", authenticate, getTenantProfile);
router.put("/:cognitoId", authenticate, updateTenantProfile);
router.get("/:cognitoId/favorites", authenticate, getFavorites);
router.post("/:cognitoId/favorites/:propertyId", authenticate, addFavorite);
router.delete("/:cognitoId/favorites/:propertyId", authenticate, removeFavorite);
export default router;
