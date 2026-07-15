//endpoint>>crud operations ///get post patch delete>>>categories
const { getCategories, getCategoryById, addCategory, updateCategory, deleteCategory } = require("../controller/categories.js");
const express = require("express");
const { isAuth } = require("../middleware/isAuth.js");
const { isAdmin } = require("../middleware/isAdmin.js");

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", isAuth, isAdmin, addCategory);
router.patch("/:id", isAuth, isAdmin, updateCategory);
router.delete("/:id", isAuth, isAdmin, deleteCategory);

module.exports = { router };
