const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
  },
  size: {
    type: String,
  },
  selectedOptions: [
    {
      optionName: String,
      valueName: String,
      priceAdjustment: Number
    }
  ],
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    orderItems: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ["cash", "card", "wallet"],
        message: "payment method must be cash, card, or wallet",
      },
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      zip: { type: String },
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "coupons",
    },
  },
  { timestamps: true },
);

let OrderModel = mongoose.model("orders", orderSchema);
module.exports = { OrderModel };
