const { UserModel } = require("../models/userModel.js");

// Add product to wishlist
async function addProductToWishlist(req, res) {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { wishlist: req.body.productId } },
      { new: true }
    ).populate("wishlist");

    res.status(200).json({
      status: "success",
      message: "Product added to wishlist.",
      data: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error adding to wishlist", error });
  }
}

// Remove product from wishlist
async function removeProductFromWishlist(req, res) {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { $pull: { wishlist: req.params.productId } },
      { new: true }
    ).populate("wishlist");

    res.status(200).json({
      status: "success",
      message: "Product removed from wishlist.",
      data: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error removing from wishlist", error });
  }
}

// Get logged user wishlist
async function getLoggedUserWishlist(req, res) {
  try {
    const user = await UserModel.findById(req.user.id).populate("wishlist");

    res.status(200).json({
      status: "success",
      results: user.wishlist.length,
      data: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching wishlist", error });
  }
}

module.exports = {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
};
