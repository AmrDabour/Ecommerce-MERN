const cron = require('node-cron');
const { CartModel } = require('../models/cartModel');
const { emailQueue } = require('../utils/queues.js');
const { winstonLogger } = require('../utils/logger.js');

// Run every hour to check for abandoned carts
function startAbandonedCartJob() {
  cron.schedule('0 * * * *', async () => {
  console.log('[CRON] Running abandoned cart check...');
  try {
    // 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find carts that:
    // 1. Have items
    // 2. Were last updated more than 24 hours ago
    // 3. Haven't been sent an email yet
    const abandonedCarts = await CartModel.find({
      'cartItems.0': { $exists: true },
      updatedAt: { $lt: twentyFourHoursAgo },
      abandonedEmailSent: false
    }).populate('user', 'name email');

    for (const cart of abandonedCarts) {
      if (cart.user && cart.user.email) {
        console.log(`[CRON] Sending abandoned cart email to ${cart.user.email}...`);
        
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Hi ${cart.user.name},</h2>
            <p>You left some great items in your cart at Luxe Store!</p>
            <p>Don't miss out before they sell out. Click below to complete your purchase:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/cart" 
               style="display: inline-block; background-color: #047857; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px;">
               Return to my Cart
            </a>
          </div>
        `;

        try {
          // Enqueue the email job in BullMQ
          await emailQueue.add('abandoned-cart', {
            email: cart.user.email,
            subject: 'Did you forget something? 🛒',
            html: html
          });

          // Mark as sent
          cart.abandonedEmailSent = true;
          await cart.save();
        } catch (emailErr) {
          winstonLogger.error(`[CRON] Failed to enqueue email for ${cart.user.email}:`, { error: emailErr.message });
        }
      }
    }
  } catch (err) {
    winstonLogger.error('[CRON] Error checking abandoned carts:', { error: err.message });
  }
  });

  console.log('[CRON] Abandoned cart job initialized.');
}

module.exports = { startAbandonedCartJob };
