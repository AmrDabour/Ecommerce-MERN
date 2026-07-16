const { OrderModel } = require("../models/orderModel.js");
const { CartModel } = require("../models/cartModel.js");
const { ProductModel } = require("../models/productModel.js");

//create order from cart
function createOrder(req, res) {
  CartModel.findOne({ user: req.user.id })
    .then((cart) => {
      if (!cart || cart.cartItems.length === 0) {
        return res.status(400).json({ msg: "cart is empty, add products first" });
      }

      //create order from cart items
      let order = {
        user: req.user.id,
        orderItems: cart.cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: cart.totalPrice,
        shippingAddress: req.body.shippingAddress || {},
        paymentMethod: req.body.paymentMethod || "cash",
      };

      return OrderModel.create(order)
        .then((newOrder) => {
          //update product sold count and reduce quantity
          let updates = cart.cartItems.map((item) => {
            return ProductModel.findByIdAndUpdate(item.product, {
              $inc: { sold: item.quantity, quantity: -item.quantity },
            });
          });

          return Promise.all(updates)
            .then(() => {
              //clear cart after order
              return CartModel.findOneAndDelete({ user: req.user.id });
            })
            .then(() => {
              res.status(201).json({ msg: "order created successfully", data: newOrder });
            });
        });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error creating order", error: err });
    });
}

//get logged user orders (or all orders for admin)
function getUserOrders(req, res) {
  let filter = {};
  if (req.user.role !== "admin") {
    filter = { user: req.user.id };
  }

  OrderModel.find(filter)
    .populate("orderItems.product", "name imageCover")
    .populate("user", "name email")
    .sort("-createdAt")
    .then((data) => {
      res.status(200).json({ msg: "orders fetched successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching orders", error: err });
    });
}

//get order by id
function getOrderById(req, res) {
  OrderModel.findById(req.params.id)
    .populate("orderItems.product", "name imageCover price")
    .populate("user", "name email phone")
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "order not found" });
      }
      //check if order belongs to user or user is admin
      if (data.user._id.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ msg: "access denied" });
      }
      res.status(200).json({ msg: "order fetched successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching order", error: err });
    });
}

//mark order as paid (admin)
function markAsPaid(req, res) {
  OrderModel.findByIdAndUpdate(
    req.params.id,
    { isPaid: true, paidAt: Date.now() },
    { new: true },
  )
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "order not found" });
      }
      res.status(200).json({ msg: "order marked as paid", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error updating order", error: err });
    });
}

//mark order as delivered (admin)
function markAsDelivered(req, res) {
  OrderModel.findByIdAndUpdate(
    req.params.id,
    { isDelivered: true, deliveredAt: Date.now() },
    { new: true },
  )
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "order not found" });
      }
      res.status(200).json({ msg: "order marked as delivered", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error updating order", error: err });
    });
}

module.exports = { createOrder, getUserOrders, getOrderById, markAsPaid, markAsDelivered };
