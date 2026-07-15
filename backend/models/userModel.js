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
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  //only hash if password is new or changed
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
});

let UserModel = mongoose.model("users", userSchema);
module.exports = { UserModel };
