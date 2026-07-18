/**
 * Professional Email Templates for Luxe Store
 * Consistent branding with Emerald theme (#047857)
 */

const BRAND = {
  name: 'Luxe Store',
  color: '#047857',
  colorDark: '#065f46',
  colorLight: '#d1fae5',
  logo: '◆ LUXE',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
};

function baseLayout(content, preheader = '') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND.name}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: ${BRAND.color}; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 28px; margin: 0; letter-spacing: 2px; }
    .body { padding: 32px; }
    .body h2 { color: #111; font-size: 22px; margin: 0 0 8px; }
    .body p { color: #555; font-size: 15px; line-height: 1.6; margin: 8px 0; }
    .btn { display: inline-block; background: ${BRAND.color}; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 16px; }
    .btn:hover { background: ${BRAND.colorDark}; }
    .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .order-table th { text-align: left; padding: 10px 12px; background: ${BRAND.colorLight}; color: ${BRAND.colorDark}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .order-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #333; }
    .order-table .total-row td { border-top: 2px solid ${BRAND.color}; font-weight: 700; font-size: 16px; border-bottom: none; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-processing { background: #dbeafe; color: #1e40af; }
    .badge-shipped { background: #e0e7ff; color: #3730a3; }
    .badge-delivered { background: ${BRAND.colorLight}; color: ${BRAND.colorDark}; }
    .badge-cancelled { background: #fee2e2; color: #991b1b; }
    .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .info-box p { margin: 4px 0; font-size: 14px; }
    .footer { background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #888; font-size: 12px; margin: 4px 0; }
    .footer a { color: ${BRAND.color}; text-decoration: none; }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
    .points-badge { display: inline-block; background: linear-gradient(135deg, ${BRAND.color}, ${BRAND.colorDark}); color: white; padding: 8px 16px; border-radius: 24px; font-weight: 700; font-size: 14px; }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <div style="padding: 24px;">
    <div class="wrapper">
      <div class="header">
        <h1>${BRAND.logo}</h1>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p>
        <p><a href="${BRAND.frontendUrl}">Visit our store</a> · <a href="${BRAND.frontendUrl}/orders">My Orders</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildItemsTable(orderItems, totalPrice) {
  let rows = '';
  for (const item of orderItems) {
    const productName = item.product?.name || 'Product';
    const color = item.color ? ` · ${item.color}` : '';
    const size = item.size ? ` · Size ${item.size}` : '';
    rows += `
      <tr>
        <td>${productName}${color}${size}</td>
        <td style="text-align:center;">${item.quantity}</td>
        <td style="text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`;
  }
  return `
    <table class="order-table">
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td colspan="2">Total</td>
          <td style="text-align:right;">$${totalPrice.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>`;
}

function statusBadge(status) {
  const cls = `badge badge-${status.toLowerCase()}`;
  return `<span class="${cls}">${status}</span>`;
}

// ─── Template Functions ───

function orderConfirmationTemplate(order, user) {
  const itemsTable = buildItemsTable(order.orderItems, order.totalPrice);
  const address = order.shippingAddress || {};

  return baseLayout(`
    <h2>Thank you for your order! 🎉</h2>
    <p>Hi <strong>${user?.name || 'Valued Customer'}</strong>,</p>
    <p>We've received your order and it's being processed. Here's a summary:</p>
    
    <div class="info-box">
      <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p><strong>Payment:</strong> ${order.paymentMethod === 'card' ? '💳 Credit Card' : '💵 Cash on Delivery'}</p>
      <p><strong>Status:</strong> ${statusBadge(order.status || 'Pending')}</p>
    </div>

    ${itemsTable}

    ${address.street ? `
    <div class="info-box">
      <p><strong>📦 Shipping Address:</strong></p>
      <p>${address.street}${address.city ? ', ' + address.city : ''}${address.zip ? ' ' + address.zip : ''}</p>
    </div>` : ''}

    <p style="text-align:center; margin-top: 24px;">
      <a href="${BRAND.frontendUrl}/orders/${order._id}" class="btn" style="color: #ffffff; text-decoration: none;">Track My Order</a>
    </p>
  `, `Your order #${order._id.toString().slice(-8).toUpperCase()} has been confirmed!`);
}

function paymentConfirmedTemplate(order, user, pointsEarned = 0) {
  const itemsTable = buildItemsTable(order.orderItems, order.totalPrice);

  return baseLayout(`
    <h2>Payment Confirmed! ✅</h2>
    <p>Hi <strong>${user?.name || 'Valued Customer'}</strong>,</p>
    <p>Your payment has been successfully processed. We're preparing your order now!</p>
    
    <div class="info-box">
      <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
      <p><strong>Amount Paid:</strong> $${order.totalPrice.toFixed(2)}</p>
      <p><strong>Status:</strong> ${statusBadge('Processing')}</p>
    </div>

    ${itemsTable}

    ${pointsEarned > 0 ? `
    <div style="text-align: center; margin: 24px 0;">
      <p style="color: #555; margin-bottom: 8px;">You earned</p>
      <span class="points-badge">+${pointsEarned} Loyalty Points ⭐</span>
    </div>` : ''}

    <p style="text-align:center; margin-top: 24px;">
      <a href="${BRAND.frontendUrl}/orders/${order._id}" class="btn" style="color: #ffffff; text-decoration: none;">View Order Details</a>
    </p>
  `, `Payment confirmed for order #${order._id.toString().slice(-8).toUpperCase()}`);
}

function orderShippedTemplate(order, user) {
  return baseLayout(`
    <h2>Your Order Has Shipped! 🚚</h2>
    <p>Hi <strong>${user?.name || 'Valued Customer'}</strong>,</p>
    <p>Great news! Your order is on its way to you.</p>
    
    <div class="info-box">
      <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
      <p><strong>Status:</strong> ${statusBadge('Shipped')}</p>
      ${order.shippingAddress?.street ? `<p><strong>Delivering to:</strong> ${order.shippingAddress.street}${order.shippingAddress.city ? ', ' + order.shippingAddress.city : ''}</p>` : ''}
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <div style="display: flex; justify-content: center; align-items: center; gap: 8px;">
        <span style="width: 24px; height: 24px; border-radius: 50%; background: ${BRAND.color}; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 12px;">✓</span>
        <span style="width: 60px; height: 3px; background: ${BRAND.color};"></span>
        <span style="width: 24px; height: 24px; border-radius: 50%; background: ${BRAND.color}; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 12px;">✓</span>
        <span style="width: 60px; height: 3px; background: ${BRAND.color};"></span>
        <span style="width: 24px; height: 24px; border-radius: 50%; background: ${BRAND.color}; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">📦</span>
        <span style="width: 60px; height: 3px; background: #e5e7eb;"></span>
        <span style="width: 24px; height: 24px; border-radius: 50%; background: #e5e7eb; display: inline-flex; align-items: center; justify-content: center; color: #888; font-size: 12px;">4</span>
      </div>
      <div style="display: flex; justify-content: center; margin-top: 8px; font-size: 11px; color: #888;">
        <span style="margin: 0 12px;">Ordered</span>
        <span style="margin: 0 12px;">Paid</span>
        <span style="margin: 0 12px;">Shipped</span>
        <span style="margin: 0 12px;">Delivered</span>
      </div>
    </div>

    <p style="text-align:center; margin-top: 24px;">
      <a href="${BRAND.frontendUrl}/orders/${order._id}" class="btn" style="color: #ffffff; text-decoration: none;">Track My Order</a>
    </p>
  `, `Your order #${order._id.toString().slice(-8).toUpperCase()} has been shipped!`);
}

function orderDeliveredTemplate(order, user) {
  return baseLayout(`
    <h2>Order Delivered! 🎉</h2>
    <p>Hi <strong>${user?.name || 'Valued Customer'}</strong>,</p>
    <p>Your order has been delivered successfully. We hope you love your purchase!</p>
    
    <div class="info-box">
      <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
      <p><strong>Status:</strong> ${statusBadge('Delivered')}</p>
      <p><strong>Delivered:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="divider"></div>

    <div style="text-align: center;">
      <p style="font-size: 16px; color: #333; font-weight: 600;">How was your experience?</p>
      <p style="color: #888;">Your feedback helps us improve and helps other shoppers.</p>
      <a href="${BRAND.frontendUrl}/orders/${order._id}" class="btn" style="margin-top: 12px; color: #ffffff; text-decoration: none;">Rate Your Purchase ⭐</a>
    </div>
  `, `Your order #${order._id.toString().slice(-8).toUpperCase()} has been delivered!`);
}

function orderCancelledTemplate(order, user) {
  return baseLayout(`
    <h2>Order Cancelled</h2>
    <p>Hi <strong>${user?.name || 'Valued Customer'}</strong>,</p>
    <p>Your order has been cancelled. If you didn't request this, please contact our support team.</p>
    
    <div class="info-box">
      <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
      <p><strong>Status:</strong> ${statusBadge('Cancelled')}</p>
      <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
    </div>

    <p>If your order was paid, a refund will be processed within 5-7 business days.</p>

    <p style="text-align:center; margin-top: 24px;">
      <a href="${BRAND.frontendUrl}/products" class="btn" style="color: #ffffff; text-decoration: none;">Continue Shopping</a>
    </p>
  `, `Your order #${order._id.toString().slice(-8).toUpperCase()} has been cancelled`);
}

function orderStatusUpdateTemplate(order, user, newStatus) {
  switch (newStatus) {
    case 'Shipped': return orderShippedTemplate(order, user);
    case 'Delivered': return orderDeliveredTemplate(order, user);
    case 'Cancelled': return orderCancelledTemplate(order, user);
    default: return null;
  }
}

module.exports = {
  orderConfirmationTemplate,
  paymentConfirmedTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
  orderCancelledTemplate,
  orderStatusUpdateTemplate,
};
