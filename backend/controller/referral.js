const { UserModel } = require("../models/userModel.js");
const { CouponModel } = require("../models/couponModel.js");

// Get the logged in user's referral code and stats
function getReferralInfo(req, res) {
  UserModel.findById(req.user.id)
    .then(async user => {
      if (!user) return res.status(404).json({ msg: "User not found" });
      
      // Generate referral code for existing users who don't have one
      if (!user.referralCode) {
        let isUnique = false;
        let newCode;
        while (!isUnique) {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let result = '';
          for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          newCode = 'LUXE-' + result;
          const existing = await UserModel.findOne({ referralCode: newCode });
          if (!existing) {
            isUnique = true;
          }
        }
        user.referralCode = newCode;
        await UserModel.updateOne({ _id: user._id }, { $set: { referralCode: newCode } });
      }

      // Also fetch any coupons they earned
      CouponModel.find({ createdFor: user._id, type: 'referral_reward' })
        .then(coupons => {
          res.status(200).json({
            msg: "Referral info fetched",
            data: {
              referralCode: user.referralCode,
              referralCount: user.referralCount,
              earnedCoupons: coupons
            }
          });
        });
    })
    .catch(err => {
      console.error("Error in getReferralInfo:", err);
      res.status(500).json({ msg: "Error fetching referral info", error: err });
    });
}

// Validate a referral code (used on the frontend during registration)
function validateReferralCode(req, res) {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ msg: "Referral code is required" });
  }

  UserModel.findOne({ referralCode: code.toUpperCase() })
    .then(user => {
      if (!user) {
        return res.status(404).json({ msg: "Invalid referral code", valid: false });
      }
      res.status(200).json({ msg: "Referral code is valid", valid: true, ownerName: user.name });
    })
    .catch(err => {
      res.status(500).json({ msg: "Error validating code", error: err });
    });
}

module.exports = {
  getReferralInfo,
  validateReferralCode
};
