"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favoritesV2Controller_1 = require("../controllers/favoritesV2Controller");
const router = (0, express_1.Router)();
router.get("/user/:userId", favoritesV2Controller_1.getFavoritesByUser);
router.post("/", favoritesV2Controller_1.addFavoriteFromBody);
router.delete("/:userId/:propertyId", favoritesV2Controller_1.removeFavoriteByUserAndProperty);
exports.default = router;
