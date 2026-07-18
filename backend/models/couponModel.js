const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    expireDate: {
      type: Date,
      required: true,
    },
    createdFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    usageLimit: {
      type: Number,
      default: 1, // How many times this code can be used (1 for referral coupons)
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['general', 'referral_reward', 'referral_welcome'],
      default: 'general',
    }
  },
  { timestamps: true },
);

let CouponModel = mongoose.model("coupons", couponSchema);
module.exports = { CouponModel };
