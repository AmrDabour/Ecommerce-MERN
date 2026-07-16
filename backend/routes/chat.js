const express = require("express");
const { handleChat } = require("../controller/chat");
const { isAuth } = require("../middleware/isAuth");

const router = express.Router();

router.post("/", isAuth, handleChat);

module.exports = router;
