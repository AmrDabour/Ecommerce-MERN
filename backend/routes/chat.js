const express = require("express");
const { handleChat } = require("../controller/chat");

const router = express.Router();

router.post("/", handleChat);

module.exports = router;
