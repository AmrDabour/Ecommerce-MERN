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
  },
  { timestamps: true },
);

let CouponModel = mongoose.model("coupons", couponSchema);
module.exports = { CouponModel };
