const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a Stripe checkout session for an order
 * @param {Object} options - Session configuration
 * @param {Array} options.lineItems - Items to purchase
 * @param {string} options.successUrl - URL to redirect on success
 * @param {string} options.cancelUrl - URL to redirect on cancel
 * @param {string} options.clientReferenceId - Custom reference ID (e.g. order ID)
 * @param {number} [options.discountAmount] - Discount amount in cents (if applicable)
 * @returns {Promise<Object>} The checkout session
 */
async function createSession(options) {
  const sessionConfig = {
    payment_method_types: ['card'],
    line_items: options.lineItems,
    mode: 'payment',
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    client_reference_id: options.clientReferenceId,
  };

  if (options.discountAmount && options.discountAmount > 0) {
    const stripeCoupon = await stripe.coupons.create({
      amount_off: options.discountAmount,
      currency: 'usd',
      duration: 'once',
      name: 'Order Discount'
    });
    sessionConfig.discounts = [{ coupon: stripeCoupon.id }];
  }

  return await stripe.checkout.sessions.create(sessionConfig);
}

/**
 * Retrieves a Stripe checkout session by ID
 * @param {string} sessionId - The Stripe session ID
 * @returns {Promise<Object>} The session object
 */
async function getSession(sessionId) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}

module.exports = {
  createSession,
  getSession
};
