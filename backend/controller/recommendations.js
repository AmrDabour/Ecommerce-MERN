const { ProductModel } = require("../models/productModel");

async function getSimilarProducts(req, res) {
  try {
    const { id } = req.params;
    const aiUrl = process.env.AI_API_URL || "http://127.0.0.1:8000";
    
    const response = await fetch(`${aiUrl}/recommendations/similar/${id}`);
    if (!response.ok) {
      throw new Error("AI service returned an error");
    }
    
    const data = await response.json();
    
    // The AI service already fetches product details and returns them
    // We just need to map 'id' to '_id' for the frontend
    const mappedProducts = data.products.map(p => ({ ...p, _id: p.id || p.product_id }));
    
    res.status(200).json({ products: mappedProducts, count: mappedProducts.length });
  } catch (error) {
    console.error("Recommendations error:", error);
    res.status(500).json({ msg: "Failed to fetch similar products", error: error.message });
  }
}

async function getUserRecommendations(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const aiUrl = process.env.AI_API_URL || "http://127.0.0.1:8000";
    
    const response = await fetch(`${aiUrl}/recommendations/user/${userId}`);
    if (!response.ok) {
      throw new Error("AI service returned an error");
    }
    
    const data = await response.json();
    
    // The AI service already fetches product details and returns them
    // We just need to map 'id' to '_id' for the frontend
    const mappedProducts = data.products.map(p => ({ ...p, _id: p.id || p.product_id }));
    
    res.status(200).json({ products: mappedProducts, count: mappedProducts.length });
  } catch (error) {
    console.error("Recommendations error:", error);
    res.status(500).json({ msg: "Failed to fetch recommendations", error: error.message });
  }
}

module.exports = { getSimilarProducts, getUserRecommendations };
