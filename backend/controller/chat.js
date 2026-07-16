// Simple mocked AI for now since we don't have a Gemini API key in env yet.
// In a real scenario, we'd use @google/generative-ai
const { ProductModel } = require("../models/productModel");

async function handleChat(req, res) {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ msg: "Message is required" });
    }

    const lowerMsg = message.toLowerCase();
    let reply = "I'm a virtual assistant for this store. How can I help you today?";

    if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      reply = "Hello there! Welcome to our store. Are you looking for anything specific today?";
    } else if (lowerMsg.includes("product") || lowerMsg.includes("buy")) {
      const products = await ProductModel.find().limit(3);
      if (products.length > 0) {
        const names = products.map(p => p.name).join(", ");
        reply = `We have some great products! For example: ${names}. You can use the search bar to find more.`;
      }
    } else if (lowerMsg.includes("price") || lowerMsg.includes("cost")) {
      reply = "Our prices are very competitive. You can see the price and any available discounts on each product page.";
    } else if (lowerMsg.includes("shipping") || lowerMsg.includes("delivery")) {
      reply = "We offer standard and express shipping. Shipping costs will be calculated at checkout.";
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ msg: "Chat service error", error });
  }
}

module.exports = { handleChat };
