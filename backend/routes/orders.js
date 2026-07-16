//endpoint>>order operations>>>orders
const { createOrder, getUserOrders, getOrderById, markAsPaid, markAsDelivered, createCheckoutSession, verifyPayment } = require("../controller/orders.js");
const express = require("express");
const { isAuth } = require("../middleware/isAuth.js");
const { isAdmin } = require("../middleware/isAdmin.js");

const router = express.Router();

router.post("/", isAuth, createOrder);
router.get("/", isAuth, getUserOrders);
router.get("/:id", isAuth, getOrderById);
router.patch("/:id/pay", isAuth, isAdmin, markAsPaid);
router.patch("/:id/deliver", isAuth, isAdmin, markAsDelivered);
router.post("/:id/checkout-session", isAuth, createCheckoutSession);
router.post("/:id/verify-payment", isAuth, verifyPayment);
module.exports = { router };
