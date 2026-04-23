import { Router } from "express";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
  toggleFavorite,
} from "../controllers/favoritesController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/:cognitoId/favorites", authenticate, getFavorites);
router.post("/:cognitoId/favorites/:propertyId", authenticate, addFavorite);
router.delete("/:cognitoId/favorites/:propertyId", authenticate, removeFavorite);
router.post("/:cognitoId/favorites/:propertyId/toggle", authenticate, toggleFavorite);

export default router;
