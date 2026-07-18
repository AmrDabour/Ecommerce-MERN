const { PushSubscriptionModel } = require('../models/pushSubscriptionModel');
const { sendPushNotification } = require('../utils/push');

// Subscribe user to push notifications
async function subscribeToPush(req, res) {
  const subscription = req.body;
  const userId = req.user.id;

  try {
    // Check if this exact endpoint already exists for this user
    let existingSub = await PushSubscriptionModel.findOne({ 
      user: userId,
      endpoint: subscription.endpoint 
    });

    if (!existingSub) {
      await PushSubscriptionModel.create({
        user: userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys
      });
    }

    res.status(201).json({ msg: 'Successfully subscribed to push notifications.' });
  } catch (err) {
    console.error('Error saving push subscription:', err);
    res.status(500).json({ msg: 'Failed to subscribe to push notifications', error: err });
  }
}

// Unsubscribe user
async function unsubscribeFromPush(req, res) {
  const { endpoint } = req.body;
  const userId = req.user.id;

  try {
    await PushSubscriptionModel.findOneAndDelete({ 
      user: userId,
      endpoint: endpoint 
    });
    res.status(200).json({ msg: 'Successfully unsubscribed from push notifications.' });
  } catch (err) {
    console.error('Error removing push subscription:', err);
    res.status(500).json({ msg: 'Failed to unsubscribe', error: err });
  }
}

// Get VAPID public key
function getVapidPublicKey(req, res) {
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
}

module.exports = { subscribeToPush, unsubscribeFromPush, getVapidPublicKey };
