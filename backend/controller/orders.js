const { OrderModel } = require("../models/orderModel.js");
const { CartModel } = require("../models/cartModel.js");
const { ProductModel } = require("../models/productModel.js");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sendEmail = require("../utils/email.js");
const emailTemplates = require("../utils/email-templates.js");
const { PushSubscriptionModel } = require("../models/pushSubscriptionModel.js");
const { sendPushNotification } = require("../utils/push.js");

//create order from cart
function createOrder(req, res) {
  CartModel.findOne({ user: req.user.id })
    .then((cart) => {
      if (!cart || cart.cartItems.length === 0) {
        return res.status(400).json({ msg: "cart is empty, add products first" });
      }

      //create order from cart items
      let order = {
        user: req.user.id,
        orderItems: cart.cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
        totalPrice: cart.totalPriceAfterDiscount || cart.totalPrice,
        shippingAddress: req.body.shippingAddress || {},
        paymentMethod: req.body.paymentMethod || "cash",
      };

      const UserModel = require("../models/userModel.js").UserModel;
      return UserModel.findById(req.user.id).then((user) => {
        let finalPrice = order.totalPrice;
        let amountPaidFromWallet = 0;
        let isFullyPaidWithWallet = false;

        if (req.body.useWallet && user.walletBalance > 0) {
          if (user.walletBalance >= finalPrice) {
            amountPaidFromWallet = finalPrice;
            user.walletBalance -= finalPrice;
            isFullyPaidWithWallet = true;
          } else {
            amountPaidFromWallet = user.walletBalance;
            user.walletBalance = 0;
          }
          order.totalPrice -= amountPaidFromWallet;
        }

        return user.save().then(() => {
          if (isFullyPaidWithWallet) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentMethod = "wallet";
          }

          return OrderModel.create(order)
            .then((newOrder) => {
          //update product sold count and reduce quantity
          let updates = cart.cartItems.map((item) => {
            return ProductModel.findByIdAndUpdate(
              item.product, 
              { $inc: { sold: item.quantity, quantity: -item.quantity } },
              { new: true }
            ).then(updatedProduct => {
              if (updatedProduct && updatedProduct.quantity < 5) {
                console.warn(`[STOCK ALERT] Product ${updatedProduct.name} (ID: ${updatedProduct._id}) is low on stock! Remaining: ${updatedProduct.quantity}`);
                // TODO: Send email to admin about low stock
              }
              return updatedProduct;
            });
          });

          return Promise.all(updates)
            .then(() => {
              //clear cart after order
              return CartModel.findOneAndDelete({ user: req.user.id });
            })
            .then(() => {
              // Send order confirmation email asynchronously (don't await)
              if (req.user && req.user.email) {
                const orderHTML = emailTemplates.orderConfirmationTemplate(newOrder, req.user);
                sendEmail({
                  email: req.user.email,
                  subject: `Order Confirmed #${newOrder._id.toString().slice(-8).toUpperCase()}`,
                  html: orderHTML
                }).catch(err => console.error("Error sending order email:", err));
              }

              res.status(201).json({ msg: "order created successfully", data: newOrder });
            });
            });
        });
      });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error creating order", error: err });
    });
}

//get logged user orders (or all orders for admin)
function getUserOrders(req, res) {
  let filter = {};
  if (req.user.role !== "admin") {
    filter = { user: req.user.id };
  }

  OrderModel.find(filter)
    .populate("orderItems.product", "name imageCover")
    .populate("user", "name email")
    .sort("-createdAt")
    .then((data) => {
      res.status(200).json({ msg: "orders fetched successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching orders", error: err });
    });
}

//get order by id
function getOrderById(req, res) {
  OrderModel.findById(req.params.id)
    .populate("orderItems.product", "name imageCover price")
    .populate("user", "name email phone")
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "order not found" });
      }
      //check if order belongs to user or user is admin
      if (data.user._id.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ msg: "access denied" });
      }
      res.status(200).json({ msg: "order fetched successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching order", error: err });
    });
}

//mark order as paid (admin)
function markAsPaid(req, res) {
  OrderModel.findByIdAndUpdate(
    req.params.id,
    { isPaid: true, paidAt: Date.now() },
    { new: true },
  )
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "order not found" });
      }
      res.status(200).json({ msg: "order marked as paid", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error updating order", error: err });
    });
}

//mark order as delivered (admin)
function markAsDelivered(req, res) {
  OrderModel.findByIdAndUpdate(
    req.params.id,
    { isDelivered: true, deliveredAt: Date.now(), status: "Delivered" },
    { new: true },
  )
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "order not found" });
      }
      res.status(200).json({ msg: "order marked as delivered", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error updating order", error: err });
    });
}

//update order status (admin)
function updateOrderStatus(req, res) {
  const newStatus = req.body.status;
  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ msg: "Invalid status value" });
  }

  let updateData = { status: newStatus };
  if (newStatus === "Delivered") {
    updateData.isDelivered = true;
    updateData.deliveredAt = Date.now();
  }

  OrderModel.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true },
  )
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "order not found" });
      }
      if (newStatus === "Shipped" || newStatus === "Delivered" || newStatus === "Cancelled") {
        data.populate("user", "name email").then(populatedOrder => {
          if (populatedOrder.user && populatedOrder.user.email) {
            const emailHtml = emailTemplates.orderStatusUpdateTemplate(populatedOrder, populatedOrder.user, newStatus);
            if (emailHtml) {
              let subject = `Order Update #${populatedOrder._id.toString().slice(-8).toUpperCase()}`;
              if (newStatus === 'Shipped') subject = 'Your Order Has Shipped! 🚚';
              if (newStatus === 'Delivered') subject = 'Your Order Has Been Delivered! 🎉';
              
              sendEmail({
                email: populatedOrder.user.email,
                subject: subject,
                html: emailHtml
              }).catch(err => console.error(`Error sending ${newStatus} email:`, err));

              // Send Push Notification
              PushSubscriptionModel.find({ user: populatedOrder.user._id })
                .then(subscriptions => {
                  const payload = {
                    notification: {
                      title: subject,
                      body: `Your order #${populatedOrder._id.toString().slice(-8).toUpperCase()} status is now: ${newStatus}`,
                      icon: '/assets/icons/icon-192x192.png',
                      data: {
                        url: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/orders/${populatedOrder._id}`
                      }
                    }
                  };
                  
                  const pushPromises = subscriptions.map(sub => 
                    sendPushNotification(sub, payload).catch(err => {
                      if (err.statusCode === 410 || err.statusCode === 404) {
                        return PushSubscriptionModel.findByIdAndDelete(sub._id);
                      }
                      console.error('Push notification error:', err);
                    })
                  );
                  Promise.all(pushPromises);
                })
                .catch(err => console.error('Error fetching push subscriptions:', err));
            }
          }
        });
      }

      res.status(200).json({ msg: `order status updated to ${newStatus}`, data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error updating order status", error: err });
    });
}

//create checkout session
async function createCheckoutSession(req, res) {
  try {
    const order = await OrderModel.findById(req.params.id)
      .populate("orderItems.product", "name imageCover price");

    if (!order) {
      return res.status(404).json({ msg: "order not found" });
    }
    
    const lineItems = order.orderItems.map((item) => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.name,
            images: item.product.imageCover ? [item.product.imageCover] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost';
    
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${frontendUrl}/checkout`,
      client_reference_id: order._id.toString(),
    };

    const subtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    console.log(`[Stripe Checkout] orderId: ${order._id}, subtotal: ${subtotal}, order.totalPrice: ${order.totalPrice}`);
    // If there is a discount applied to the total price
    if (order.totalPrice < subtotal) {
      const discountAmount = Math.round((subtotal - order.totalPrice) * 100);
      console.log(`[Stripe Checkout] Creating coupon for discountAmount: ${discountAmount} cents`);
      const stripeCoupon = await stripe.coupons.create({
        amount_off: discountAmount,
        currency: 'usd',
        duration: 'once',
        name: 'Order Discount'
      });
      console.log(`[Stripe Checkout] Coupon created: ${stripeCoupon.id}`);
      sessionConfig.discounts = [{ coupon: stripeCoupon.id }];
    } else {
      console.log(`[Stripe Checkout] No discount applied. totalPrice (${order.totalPrice}) >= subtotal (${subtotal})`);
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    res.status(200).json({ msg: "session created", sessionUrl: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creating checkout session", error: err.message });
  }
}

//verify payment
function verifyPayment(req, res) {
  const sessionId = req.body.session_id;
  if (!sessionId) {
    return res.status(400).json({ msg: "session_id is required" });
  }

  stripe.checkout.sessions.retrieve(sessionId)
    .then((session) => {
      if (session.payment_status === 'paid') {
        const orderId = session.client_reference_id;
        return OrderModel.findByIdAndUpdate(
          orderId,
          { isPaid: true, paidAt: Date.now() },
          { new: true }
        ).populate('user').then(async (order) => {
          // Reward points (1 point per $1 spent)
          if (order.user) {
            const pointsEarned = Math.floor(order.totalPrice);
            order.user.points += pointsEarned;
            
            // Update loyalty tier
            if (order.user.points >= 5000) order.user.loyaltyTier = 'Platinum';
            else if (order.user.points >= 2000) order.user.loyaltyTier = 'Gold';
            else if (order.user.points >= 500) order.user.loyaltyTier = 'Silver';
            
            await order.user.save();
          }

          // Send payment confirmation email asynchronously
          if (order.user && order.user.email) {
            const orderHTML = emailTemplates.paymentConfirmedTemplate(order, order.user, pointsEarned);
            sendEmail({
              email: order.user.email,
              subject: `Payment Confirmed #${order._id.toString().slice(-8).toUpperCase()}`,
              html: orderHTML
            }).catch(err => console.error("Error sending payment email:", err));
          }

          res.status(200).json({ msg: "payment verified", data: order });
        });
      } else {
        res.status(400).json({ msg: "payment not completed" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ msg: "Error verifying payment", error: err.message });
    });
}

module.exports = { createOrder, getUserOrders, getOrderById, markAsPaid, markAsDelivered, updateOrderStatus, createCheckoutSession, verifyPayment };
