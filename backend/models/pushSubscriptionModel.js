const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  keys: {
    p256dh: String,
    auth: String,
  },
}, { timestamps: true });

const PushSubscriptionModel = mongoose.model('PushSubscription', pushSubscriptionSchema);

module.exports = { PushSubscriptionModel };
