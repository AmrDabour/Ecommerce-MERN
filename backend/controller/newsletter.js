const { NewsletterModel } = require("../models/newsletterModel.js");

async function subscribeToNewsletter(req, res) {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes("@")) {
      return res.status(400).json({ msg: "Please provide a valid email" });
    }

    const existing = await NewsletterModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "You are already subscribed!" });
    }

    await NewsletterModel.create({ email });

    res.status(201).json({
      status: "success",
      message: "Successfully subscribed to the newsletter!",
    });
  } catch (error) {
    res.status(500).json({ msg: "Error subscribing to newsletter", error });
  }
}

module.exports = { subscribeToNewsletter };
