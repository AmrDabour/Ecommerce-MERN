//endpoint>>crud operations ///get post patch delete>>>reviews
const { getReviews, getReviewById, addReview, updateReview, deleteReview } = require("../controller/reviews.js");
const express = require("express");
const { isAuth } = require("../middleware/isAuth.js");

const router = express.Router();

router.get("/", getReviews);
router.get("/:id", getReviewById);
router.post("/", isAuth, addReview);
router.patch("/:id", isAuth, updateReview);
router.delete("/:id", isAuth, deleteReview);

module.exports = { router };
