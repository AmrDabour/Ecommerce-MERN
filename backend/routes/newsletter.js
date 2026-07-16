const express = require("express");
const { subscribeToNewsletter } = require("../controller/newsletter");

const router = express.Router();

router.post("/subscribe", subscribeToNewsletter);

module.exports = router;
