const express = require("express");
const { isAuth } = require("../middleware/isAuth.js");
const { isAdmin } = require("../middleware/isAdmin.js");
const {
  createGiftCard,
  getAllGiftCards,
  redeemGiftCard,
} = require("../controller/giftCards");

const router = express.Router();

// User routes
router.post("/redeem", isAuth, redeemGiftCard);

// Admin routes
router
  .route("/")
  .get(isAuth, isAdmin, getAllGiftCards)
  .post(isAuth, isAdmin, createGiftCard);



module.exports = router;
