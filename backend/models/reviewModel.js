const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
  },
  { timestamps: true },
);

//one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

let ReviewModel = mongoose.model("reviews", reviewSchema);
module.exports = { ReviewModel };
