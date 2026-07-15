const { ReviewModel } = require("../models/reviewModel.js");
const { ProductModel } = require("../models/productModel.js");

//helper >>update product rating stats
function updateProductRatings(productId) {
  ReviewModel.find({ product: productId })
    .then((reviews) => {
      let count = reviews.length;
      let avg = 0;
      if (count > 0) {
        let sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        avg = (sum / count).toFixed(1) * 1;
      }
      return ProductModel.findByIdAndUpdate(productId, {
        ratingsAvg: avg,
        ratingsCount: count,
      });
    })
    .catch((err) => {
      console.log("Error updating product ratings", err);
    });
}

//get all reviews
function getReviews(req, res) {
  let filter = {};
  //filter by product >>?product=id
  if (req.query.product) {
    filter.product = req.query.product;
  }

  ReviewModel.find(filter)
    .populate("user", "name email")
    .populate("product", "name")
    .then((data) => {
      res.status(200).json({ msg: "reviews fetched successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching reviews", error: err });
    });
}

//get review by id
function getReviewById(req, res) {
  ReviewModel.findById(req.params.id)
    .populate("user", "name email")
    .populate("product", "name")
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "review not found" });
      }
      res.status(200).json({ msg: "review fetched successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching review", error: err });
    });
}

//create review
function addReview(req, res) {
  //set user from token
  req.body.user = req.user.id;

  ReviewModel.create(req.body)
    .then((data) => {
      //update product rating stats
      updateProductRatings(data.product);
      res.status(201).json({ msg: "review added successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error adding review", error: err });
    });
}

//update review (own review only)
function updateReview(req, res) {
  ReviewModel.findById(req.params.id)
    .then((review) => {
      if (!review) {
        return res.status(404).json({ msg: "review not found" });
      }
      //check if review belongs to user
      if (review.user.toString() !== req.user.id) {
        return res.status(403).json({ msg: "you can only update your own review" });
      }

      return ReviewModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then((data) => {
          updateProductRatings(data.product);
          res.status(200).json({ msg: "review updated successfully", data: data });
        });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error updating review", error: err });
    });
}

//delete review (own review or admin)
function deleteReview(req, res) {
  ReviewModel.findById(req.params.id)
    .then((review) => {
      if (!review) {
        return res.status(404).json({ msg: "review not found" });
      }
      //check if review belongs to user or user is admin
      if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ msg: "you can only delete your own review" });
      }

      let productId = review.product;
      return ReviewModel.findByIdAndDelete(req.params.id)
        .then(() => {
          updateProductRatings(productId);
          res.status(200).json({ msg: "review deleted successfully" });
        });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error deleting review", error: err });
    });
}

module.exports = { getReviews, getReviewById, addReview, updateReview, deleteReview };
