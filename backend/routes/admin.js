const express = require("express");
const { getDashboardStats } = require("../controller/admin.js");
const { isAuth } = require("../middleware/isAuth.js");
const { isAdmin } = require("../middleware/isAdmin.js");

const router = express.Router();

router.get("/stats", isAuth, isAdmin, getDashboardStats);

module.exports = { router };
