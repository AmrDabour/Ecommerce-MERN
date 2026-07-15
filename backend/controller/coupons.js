const { CouponModel } = require("../models/couponModel.js");
const { CartModel } = require("../models/cartModel.js");

//get all coupons
function getCoupons(req, res) {
  CouponModel.find()
    .then((data) => {
      res.status(200).json({ msg: "coupons fetched successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching coupons", error: err });
    });
}

//create coupon
function addCoupon(req, res) {
  CouponModel.create(req.body)
    .then((data) => {
      res.status(201).json({ msg: "coupon created successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error creating coupon", error: err });
    });
}

//update coupon
function updateCoupon(req, res) {
  CouponModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "coupon not found" });
      }
      res.status(200).json({ msg: "coupon updated successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error updating coupon", error: err });
    });
}

//delete coupon
function deleteCoupon(req, res) {
  CouponModel.findByIdAndDelete(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "coupon not found" });
      }
      res.status(200).json({ msg: "coupon deleted successfully" });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error deleting coupon", error: err });
    });
}

//apply coupon to cart
function applyCoupon(req, res) {
  let code = req.body.code;

  if (!code) {
    return res.status(400).json({ msg: "please enter coupon code" });
  }

  CouponModel.findOne({ code: code.toUpperCase() })
    .then((coupon) => {
      if (!coupon) {
        return res.status(404).json({ msg: "coupon not found or invalid" });
      }
      //check if coupon expired
      if (coupon.expireDate < Date.now()) {
        return res.status(400).json({ msg: "coupon expired" });
      }

      return CartModel.findOne({ user: req.user.id })
        .then((cart) => {
          if (!cart) {
            return res.status(404).json({ msg: "cart not found" });
          }

          //calc total before discount
          let totalBeforeDiscount = 0;
          cart.cartItems.forEach((item) => {
            totalBeforeDiscount += item.price * item.quantity;
          });

          //apply discount
          let discountAmount = (totalBeforeDiscount * coupon.discount) / 100;
          cart.totalPrice = (totalBeforeDiscount - discountAmount).toFixed(2) * 1;

          return cart.save();
        })
        .then((data) => {
          res.status(200).json({ msg: "coupon applied successfully", data: data });
        });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error applying coupon", error: err });
    });
}

module.exports = { getCoupons, addCoupon, updateCoupon, deleteCoupon, applyCoupon };
