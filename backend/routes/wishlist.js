const express = require("express");
const { isAuth } = require("../middleware/isAuth");
const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../controller/wishlist");

const router = express.Router();

router.use(isAuth); // Require authentication for all wishlist routes

router.route("/")
  .get(getLoggedUserWishlist)
  .post(addProductToWishlist);

router.route("/:productId")
  .delete(removeProductFromWishlist);

module.exports = router;
