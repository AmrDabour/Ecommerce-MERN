require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
    const coupon = await stripe.coupons.create({
      amount_off: 1932,
      currency: 'usd',
      duration: 'once',
      name: 'Order Discount'
    });
    console.log("Coupon created:", coupon.id);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Test' },
          unit_amount: 9656,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost/success',
      cancel_url: 'http://localhost/cancel',
      discounts: [{ coupon: coupon.id }],
    });
    console.log("Session created:", session.url);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
