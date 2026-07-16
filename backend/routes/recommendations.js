const express = require("express");
const { getSimilarProducts, getUserRecommendations } = require("../controller/recommendations");
const { isAuth } = require("../middleware/isAuth");

const router = express.Router();

router.get("/similar/:id", getSimilarProducts);
router.get("/user", isAuth, getUserRecommendations);

module.exports = router;
