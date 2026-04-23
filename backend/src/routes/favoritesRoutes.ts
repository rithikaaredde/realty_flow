import { Router } from "express";
import {
  addFavoriteFromBody,
  getFavoritesByUser,
  removeFavoriteByUserAndProperty,
} from "../controllers/favoritesV2Controller";

const router = Router();

router.get("/user/:userId", getFavoritesByUser);
router.post("/", addFavoriteFromBody);
router.delete("/:userId/:propertyId", removeFavoriteByUserAndProperty);

export default router;

