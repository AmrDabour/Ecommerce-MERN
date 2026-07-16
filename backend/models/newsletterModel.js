const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (value) => value.includes("@"),
        message: "Email Not Valid",
      },
    },
  },
  { timestamps: true }
);

const NewsletterModel = mongoose.model("Newsletter", newsletterSchema);
module.exports = { NewsletterModel };
