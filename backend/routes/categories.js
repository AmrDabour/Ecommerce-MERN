//endpoint>>crud operations ///get post patch delete>>>categories
const { getCategories, getCategoryById, addCategory, updateCategory, deleteCategory } = require("../controller/categories.js");
const express = require("express");
const { isAuth } = require("../middleware/isAuth.js");
const { isAdmin } = require("../middleware/isAdmin.js");
const { cache } = require("../middleware/cache.js");

const router = express.Router();

router.get("/", cache(86400), getCategories); // Cache categories for 1 day
router.get("/:id", cache(86400), getCategoryById);
router.post("/", isAuth, isAdmin, addCategory);
router.patch("/:id", isAuth, isAdmin, updateCategory);
router.delete("/:id", isAuth, isAdmin, deleteCategory);

module.exports = { router };
