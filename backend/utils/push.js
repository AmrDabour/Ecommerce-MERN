const webpush = require('web-push');

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:' + (process.env.EMAIL_USER || 'support@luxestore.com'),
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

module.exports = { sendPushNotification };
