//endpoint>>coupon operations>>>coupons
const { getCoupons, addCoupon, updateCoupon, deleteCoupon, applyCoupon } = require("../controller/coupons.js");
const express = require("express");
const { isAuth } = require("../middleware/isAuth.js");
const { isAdmin } = require("../middleware/isAdmin.js");

const router = express.Router();

router.get("/", isAuth, isAdmin, getCoupons);
router.post("/", isAuth, isAdmin, addCoupon);
router.post("/apply", isAuth, applyCoupon);
router.patch("/:id", isAuth, isAdmin, updateCoupon);
router.delete("/:id", isAuth, isAdmin, deleteCoupon);

module.exports = { router };
