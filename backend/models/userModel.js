const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (value) => {
          return value.includes("@");
        },
        message: "Email Not Valid",
      },
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "role must be user or admin",
      },
      default: "user",
    },
    address: {
      street: { type: String },
      city: { type: String },
      zip: { type: String },
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "products",
      },
    ],
    points: {
      type: Number,
      default: 0,
    },
    loyaltyTier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Bronze",
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true // Allows multiple users to not have a code initially
    },
    referredBy: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

function generateReferralCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'LUXE-' + result;
}

userSchema.pre("save", async function () {
  // Generate referral code if not exists
  if (!this.referralCode) {
    let isUnique = false;
    while (!isUnique) {
      const newCode = generateReferralCode();
      const existing = await mongoose.models.users.findOne({ referralCode: newCode });
      if (!existing) {
        this.referralCode = newCode;
        isUnique = true;
      }
    }
  }

  //only hash if password is new or changed
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
});

let UserModel = mongoose.model("users", userSchema);
module.exports = { UserModel };
