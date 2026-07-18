const mongoose = require("mongoose");

const giftCardSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Gift card must have a code"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Gift card must have an amount"],
      min: [1, "Amount must be at least 1"],
    },
    status: {
      type: String,
      enum: ["active", "used", "expired"],
      default: "active",
    },
    expiryDate: {
      type: Date,
      required: [true, "Gift card must have an expiry date"],
    },
    usedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    usedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Middleware to automatically check expiry
giftCardSchema.pre(/^find/, function (next) {
  this.find({
    $or: [
      { expiryDate: { $gt: Date.now() } },
      { status: { $ne: "active" } }
    ]
  });
  if (typeof next === 'function') {
    next();
  }
});

const GiftCardModel = mongoose.model("GiftCard", giftCardSchema);

module.exports = GiftCardModel;
