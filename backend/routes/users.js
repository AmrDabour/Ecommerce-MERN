//endpoint>>crud operations ///get post patch delete>>>users
const { addUser, getUsers, getUserById, login, updateUser, deleteUser } = require("../controller/users.js");
const express = require("express");
const { isAuth } = require("../middleware/isAuth.js");
const { isAdmin } = require("../middleware/isAdmin.js");

const router = express.Router();

router.get("/", isAuth, isAdmin, getUsers);
router.get("/:id", isAuth, getUserById);
router.post("/register", addUser);
router.post("/login", login);
router.patch("/:id", isAuth, updateUser);
router.delete("/:id", isAuth, isAdmin, deleteUser);

module.exports = { router };
