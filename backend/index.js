require("./instrument.js");
require("dotenv").config();
const Sentry = require("@sentry/node");
const express = require("express");
const cors = require("cors");
const app = express();
const { logger } = require("./middleware/logger.js");
const mongoose = require("mongoose");

// Initialize Cron Jobs
require('./cron/abandonedCart.js');

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
const { router: notificationsRouter } = require("./routes/notifications.js");

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

// Limit requests from same API
const limiter = rateLimit({
  max: 200, // Limit each IP to 200 requests per windowMs
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
// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

//=====error handling======//
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ msg: "something broke!!!! ", err });
});

//=====not found routes======//
app.use((req, res, next) => {
  res.status(404).json("route is not found");
});

//return promise>>connect to mongo db
mongoose
  .connect(process.env.DATA_BASE_URL)
  .then(() => {
    console.log("connected to MONGO DB successfully ");
  })
  .catch((err) => {
    console.log(err);
  });

//start server
app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err);
  }

  console.log("port connected successfully");
});

//////  MVC >> MODEL VIEW CONTROLLER
