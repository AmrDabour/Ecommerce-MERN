const express = require("express");
const referralRouter = express.Router();
const { getReferralInfo, validateReferralCode } = require("../controller/referral.js");
const { isAuth } = require("../middleware/isAuth.js");

// Validate a code during registration (public route)
referralRouter.post("/validate", validateReferralCode);

// Get my referral info (protected)
referralRouter.get("/my-info", isAuth, getReferralInfo);

module.exports = { referralRouter };
