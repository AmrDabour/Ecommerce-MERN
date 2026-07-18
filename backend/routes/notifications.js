const express = require('express');
const { isAuth } = require('../middleware/isAuth');
const { subscribeToPush, unsubscribeFromPush, getVapidPublicKey } = require('../controller/notifications');

const router = express.Router();

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', isAuth, subscribeToPush);
router.post('/unsubscribe', isAuth, unsubscribeFromPush);

module.exports = { router };
