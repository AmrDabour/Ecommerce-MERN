//endpoint>>crud operations ///get post patch delete>>>products
const { getProducts, getProductById, addProduct, updateProduct, deleteProduct } = require("../controller/products.js");
const express = require("express");
const { isAuth } = require("../middleware/isAuth.js");
const { isAdmin } = require("../middleware/isAdmin.js");
const { cache } = require("../middleware/cache.js");

const router = express.Router();

router.get("/", cache(300), getProducts);
router.get("/:id", cache(300), getProductById);
router.post("/", isAuth, isAdmin, addProduct);
router.patch("/:id", isAuth, isAdmin, updateProduct);
router.delete("/:id", isAuth, isAdmin, deleteProduct);

module.exports = { router };
