//endpoint>>cart operations>>>cart
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require("../controller/cart.js");
const express = require("express");
const { isAuth } = require("../middleware/isAuth.js");

const router = express.Router();

//all cart routes need auth
router.get("/", isAuth, getCart);
router.post("/", isAuth, addToCart);
router.patch("/:itemId", isAuth, updateCartItem);
router.delete("/clear", isAuth, clearCart);
router.delete("/:itemId", isAuth, removeCartItem);

module.exports = { router };
