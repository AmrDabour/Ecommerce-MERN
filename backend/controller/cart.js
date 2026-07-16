const { CartModel } = require("../models/cartModel.js");
const { ProductModel } = require("../models/productModel.js");

//helper >>calculate total price
function calcTotalPrice(cartItems) {
  let total = 0;
  cartItems.forEach((item) => {
    total += item.price * item.quantity;
  });
  return total;
}

//get logged user cart
function getCart(req, res) {
  CartModel.findOne({ user: req.user.id })
    .populate("cartItems.product", "name imageCover")
    .then((cart) => {
      if (!cart) {
        return res.status(200).json({ msg: "cart is empty", data: { cartItems: [], totalPrice: 0 } });
      }
      res.status(200).json({ msg: "cart fetched successfully", data: cart });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching cart", error: err });
    });
}

//add product to cart
function addToCart(req, res) {
  let productId = req.body.product;

  ProductModel.findById(productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ msg: "product not found" });
      }

      let price = product.priceAfterDiscount || product.price;

      return CartModel.findOne({ user: req.user.id })
        .then((cart) => {
          if (!cart) {
            //create new cart
            return CartModel.create({
              user: req.user.id,
              cartItems: [{ product: productId, quantity: 1, price: price }],
              totalPrice: price,
            });
          }

          //check if product already in cart
          let itemIndex = cart.cartItems.findIndex(
            (item) => item.product.toString() === productId,
          );

          if (itemIndex > -1) {
            //increase quantity
            cart.cartItems[itemIndex].quantity += 1;
          } else {
            //add new item
            cart.cartItems.push({ product: productId, quantity: 1, price: price });
          }

          cart.totalPrice = calcTotalPrice(cart.cartItems);
          return cart.save().then(savedCart => savedCart.populate("cartItems.product", "name imageCover"));
        })
        .then((data) => {
          res.status(200).json({ msg: "product added to cart", data: data });
        });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error adding to cart", error: err });
    });
}

//update cart item quantity
function updateCartItem(req, res) {
  CartModel.findOne({ user: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).json({ msg: "cart not found" });
      }

      let item = cart.cartItems.id(req.params.itemId);
      if (!item) {
        return res.status(404).json({ msg: "item not found in cart" });
      }

      item.quantity = req.body.quantity;
      cart.totalPrice = calcTotalPrice(cart.cartItems);
      return cart.save().then(savedCart => savedCart.populate("cartItems.product", "name imageCover"));
    })
    .then((data) => {
      res.status(200).json({ msg: "cart item updated", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error updating cart item", error: err });
    });
}

//remove item from cart
function removeCartItem(req, res) {
  CartModel.findOne({ user: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).json({ msg: "cart not found" });
      }

      cart.cartItems = cart.cartItems.filter(
        (item) => item._id.toString() !== req.params.itemId,
      );

      cart.totalPrice = calcTotalPrice(cart.cartItems);
      return cart.save().then(savedCart => savedCart.populate("cartItems.product", "name imageCover"));
    })
    .then((data) => {
      res.status(200).json({ msg: "item removed from cart", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error removing cart item", error: err });
    });
}

//clear whole cart
function clearCart(req, res) {
  CartModel.findOneAndDelete({ user: req.user.id })
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "cart not found" });
      }
      res.status(200).json({ msg: "cart cleared successfully" });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error clearing cart", error: err });
    });
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
