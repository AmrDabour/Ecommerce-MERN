const GiftCardModel = require("../models/giftCardModel");
const { UserModel } = require("../models/userModel");
const crypto = require("crypto");

// @desc    Create a new gift card
// @route   POST /api/gift-cards
// @access  Private/Admin
exports.createGiftCard = async (req, res) => {
  const { amount, expiryDate } = req.body;

  if (!amount || !expiryDate) {
    return res.status(400).json({ msg: "Please provide amount and expiry date" });
  }

  // Generate a random code: LUXE-GIFT-XXXXXX
  const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
  const code = `LUXE-GIFT-${randomString}`;

  const giftCard = await GiftCardModel.create({
    code,
    amount,
    expiryDate,
  });

  res.status(201).json({ msg: "Gift card created successfully", data: giftCard });
};

// @desc    Get all gift cards
// @route   GET /api/gift-cards
// @access  Private/Admin
exports.getAllGiftCards = async (req, res) => {
  const giftCards = await GiftCardModel.find().sort("-createdAt");
  res.status(200).json({ results: giftCards.length, data: giftCards });
};

// @desc    Redeem a gift card
// @route   POST /api/gift-cards/redeem
// @access  Private/User
exports.redeemGiftCard = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ msg: "Please provide a gift card code" });
  }

  // Try to find the gift card (Pre-find hook handles expiry check for active cards)
  const giftCard = await GiftCardModel.findOne({ code: code.toUpperCase() });

  if (!giftCard) {
    return res.status(404).json({ msg: "Invalid or expired gift card code" });
  }

  if (giftCard.status !== "active") {
    return res.status(400).json({ msg: `This gift card is already ${giftCard.status}` });
  }

  if (giftCard.expiryDate < Date.now()) {
    giftCard.status = "expired";
    await giftCard.save();
    return res.status(400).json({ msg: "This gift card has expired" });
  }

  // Add amount to user's wallet
  const user = await UserModel.findById(req.user.id);
  user.walletBalance = (user.walletBalance || 0) + giftCard.amount;
  await user.save();

  // Mark gift card as used
  giftCard.status = "used";
  giftCard.usedBy = req.user.id;
  giftCard.usedAt = Date.now();
  await giftCard.save();

  res.status(200).json({
    msg: "Gift card redeemed successfully",
    addedAmount: giftCard.amount,
    newBalance: user.walletBalance,
  });
};
