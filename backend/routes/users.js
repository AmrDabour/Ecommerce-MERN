//endpoint>>crud operations ///get post patch delete>>>users
const { addUser, getUsers, getUserById, login, updateUser, deleteUser, forgotPassword, resetPassword } = require("../controller/users.js");
const express = require("express");
const { isAuth } = require("../middleware/isAuth.js");
const { isAdmin } = require("../middleware/isAdmin.js");

const router = express.Router();
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many authentication attempts from this IP, please try again in 15 minutes",
});

router.get("/", isAuth, isAdmin, getUsers);
router.get("/:id", isAuth, getUserById);
router.post("/register", authLimiter, addUser);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.patch("/:id", isAuth, updateUser);
router.delete("/:id", isAuth, isAdmin, deleteUser);

module.exports = { router };
