require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { logger } = require("./middleware/logger.js");
const mongoose = require("mongoose");

//import all routers
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

//cors>>cross origin
app.use(
  cors({
    origin: "*",
  }),
);

//parse json body (MUST be before routes)
app.use(express.json());
app.use(logger);

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
app.use("/newsletter", newsletterRouter);
app.use("/chat", chatRouter);

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
