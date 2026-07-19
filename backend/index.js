require("./instrument.js");
require("dotenv").config();
const Sentry = require("@sentry/node");
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const { logger } = require("./middleware/logger.js");
const { winstonLogger } = require("./utils/logger.js");
const mongoose = require("mongoose");

// Initialize Cron Jobs
const { startAbandonedCartJob } = require('./cron/abandonedCart.js');
startAbandonedCartJob();

const { router: userRouter } = require("./routes/users.js");
const { router: categoryRouter } = require("./routes/categories.js");
const { router: productRouter } = require("./routes/products.js");
const { router: reviewRouter } = require("./routes/reviews.js");
const { router: cartRouter } = require("./routes/cart.js");
const { router: orderRouter } = require("./routes/orders.js");
const { router: couponRouter } = require("./routes/coupons.js");
const wishlistRouter = require("./routes/wishlist.js");
const newsletterRouter = require("./routes/newsletter.js");
const chatRouter = require("./routes/chat.js");
const recommendationsRouter = require("./routes/recommendations.js");
const { referralRouter } = require("./routes/referral.js");
const giftCardRoute = require("./routes/giftCards");
const { webhookCheckout } = require("./controller/orders");
const { router: notificationsRouter } = require("./routes/notifications.js");
const liveChatRouter = require("./routes/liveChat.js");
const { router: adminRouter } = require("./routes/admin.js");
const socketHandler = require("./transport/socketHandler.js");

//cors>>cross origin
app.use(
  cors({
    origin: "*",
  }),
);

//parse json body (MUST be before routes)
app.use(express.json());
app.use(logger);

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Set security HTTP headers
app.use(helmet());

// Trust proxy so it gets the real client IP instead of 127.0.0.1
app.set('trust proxy', 1);

// Limit requests from same API
const limiter = rateLimit({
  max: 5000, // Limit each IP to 5000 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Too many requests from this IP, please try again in 15 minutes",
});
app.use("/api", limiter); // Apply generally (if API had /api prefix)
app.use(limiter); // Apply to all routes for now

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

//========routing========//
// endpoints /ROUTES//
app.use("/users", userRouter);
app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/reviews", reviewRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/coupons", couponRouter);
app.use("/wishlist", wishlistRouter);
app.use("/chat", chatRouter);
app.use("/newsletter", newsletterRouter);
app.use("/recommendations", recommendationsRouter);
app.use("/referral", referralRouter);
app.use("/notifications", notificationsRouter);
app.use("/gift-cards", giftCardRoute);
app.use("/live-chat", liveChatRouter);
app.use("/admin", adminRouter);
// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

//=====error handling======//
app.use((err, req, res, next) => {
  winstonLogger.error(`Unhandled Error: ${err.message}`, { stack: err.stack, path: req.path });
  res.status(500).json({ msg: "something broke!!!! ", err: err.message });
});

//=====not found routes======//
app.use((req, res, next) => {
  res.status(404).json("route is not found");
});

mongoose
  .connect(process.env.DATA_BASE_URL)
  .then(() => {
    winstonLogger.info("connected to MONGO DB successfully ");
  })
  .catch((err) => {
    winstonLogger.error("Failed to connect to MongoDB", { error: err.message });
  });

//start server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
socketHandler(io);

server.listen(process.env.PORT, (err) => {
  if (err) {
    winstonLogger.error("Error starting server", { error: err.message });
  }

  winstonLogger.info(`Server connected successfully on port ${process.env.PORT}`);
});

//////  MVC >> MODEL VIEW CONTROLLER
