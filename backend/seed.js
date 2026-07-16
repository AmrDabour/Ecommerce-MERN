require("dotenv").config();
const mongoose = require("mongoose");
const { UserModel } = require("./models/userModel");
const { CategoryModel } = require("./models/categoryModel");
const { ProductModel } = require("./models/productModel");
const { CouponModel } = require("./models/couponModel");

const DATA_BASE_URL = process.env.DATA_BASE_URL || "mongodb://localhost:27017/ecommerce";

async function seed() {
  try {
    console.log("Connecting to Database:", DATA_BASE_URL);
    await mongoose.connect(DATA_BASE_URL);
    console.log("Database connected successfully.");

    // Clear existing data
    console.log("Clearing existing data...");
    await UserModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CouponModel.deleteMany({});
    console.log("Existing data cleared.");

    // Seed Users
    console.log("Seeding Users...");
    const adminUser = new UserModel({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123", // Will be auto-hashed by pre-save hook
      phone: "01000000000",
      role: "admin",
      address: {
        street: "Admin HQ St",
        city: "Cairo",
        zip: "11111"
      }
    });

    const standardUser = new UserModel({
      name: "Ahmed Mohamed",
      email: "ahmed@example.com",
      password: "password123", // Will be auto-hashed by pre-save hook
      phone: "01234567890",
      role: "user",
      address: {
        street: "123 Main St",
        city: "Cairo",
        zip: "12345"
      }
    });

    await adminUser.save();
    await standardUser.save();
    console.log("Users seeded successfully.");

    // Seed Categories
    console.log("Seeding Categories...");
    const categoriesData = [
      { name: "Electronics", description: "Smartphones, gadgets, and general electronic accessories." },
      { name: "Audio", description: "Immersive sound, premium speakers, and noise-cancelling headphones." },
      { name: "Wearables", description: "Smartwatches, fitbands, and fashionable health trackers." },
      { name: "Home Decor", description: "Minimalist desk lamps, ergonomic office chairs, and designer elements." }
    ];

    const categories = [];
    for (const cat of categoriesData) {
      const createdCat = await new CategoryModel(cat).save();
      categories.push(createdCat);
    }
    console.log("Categories seeded successfully.");

    // Helpers to find Category IDs
    const getCatId = (name) => categories.find(c => c.name === name)._id;

    // Seed Products
    console.log("Seeding Products...");
    const productsData = [
      {
        name: "iPhone 15 Pro Max",
        description: "Experience the latest Apple masterpiece with an A17 Pro GPU chip, a stunning grade-5 titanium body frame, and an state-of-the-art telephoto camera zoom.",
        price: 1199,
        priceAfterDiscount: 1099,
        quantity: 35,
        imageCover: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60",
        category: getCatId("Electronics"),
        ratingsAvg: 4.8,
        ratingsCount: 15,
        sold: 22
      },
      {
        name: "Pro Wireless Headphones",
        description: "Engineered with premium Active Noise Cancellation (ANC), custom acoustic drivers, and spatial audio support. Delivers up to 45 hours of deep bass playback on a single charge.",
        price: 299,
        priceAfterDiscount: 249,
        quantity: 50,
        imageCover: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        category: getCatId("Audio"),
        ratingsAvg: 4.9,
        ratingsCount: 42,
        sold: 115
      },
      {
        name: "Smart Watch Series 9",
        description: "Your ultimate health companion. Monitors blood oxygen level, performs ECG, and tracks custom sleep trends. Fitted with an always-on premium OLED retina display.",
        price: 399,
        priceAfterDiscount: 369,
        quantity: 25,
        imageCover: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&auto=format&fit=crop&q=60",
        category: getCatId("Wearables"),
        ratingsAvg: 4.7,
        ratingsCount: 28,
        sold: 64
      },
      {
        name: "Minimalist Table Lamp",
        description: "Add a touch of modern architectural aesthetics to your bedside table or office desk. Features step-less touch dimming controls and eco-friendly warm LED light.",
        price: 89,
        priceAfterDiscount: 79,
        quantity: 12,
        imageCover: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60",
        category: getCatId("Home Decor"),
        ratingsAvg: 4.5,
        ratingsCount: 9,
        sold: 18
      },
      {
        name: "Bluetooth Waterproof Speaker",
        description: "IPX7 certified completely dust and waterproof wireless speaker. Packs dual passive subwoofers for heavy bass output. Ideal for pool side hangouts and beach parties.",
        price: 129,
        priceAfterDiscount: 99,
        quantity: 60,
        imageCover: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60",
        category: getCatId("Audio"),
        ratingsAvg: 4.6,
        ratingsCount: 31,
        sold: 92
      },
      {
        name: "Ergonomic Office Chair",
        description: "Engineered with responsive dynamic lumbar support, adaptive 3D armrests, and high-elastic breathable mesh backing. Relieves spinal stress for long work sessions.",
        price: 349,
        priceAfterDiscount: 299,
        quantity: 15,
        imageCover: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=60",
        category: getCatId("Home Decor"),
        ratingsAvg: 4.8,
        ratingsCount: 14,
        sold: 27
      },
      {
        name: "Mechanical Gaming Keyboard",
        description: "Tactile mechanical brown switches, fully customizable per-key RGB backlighting, and premium aluminum key frames. Supports complete hot-swappable key layouts.",
        price: 149,
        priceAfterDiscount: 129,
        quantity: 40,
        imageCover: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60",
        category: getCatId("Electronics"),
        ratingsAvg: 4.6,
        ratingsCount: 22,
        sold: 51
      },
      {
        name: "Noise Cancelling Earbuds",
        description: "Ultra-lightweight wireless earbuds with next-gen hybrid ANC. Features smart wear detection and crystal-clear calls utilizing triple responsive microphones.",
        price: 199,
        priceAfterDiscount: 179,
        quantity: 80,
        imageCover: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60",
        category: getCatId("Audio"),
        ratingsAvg: 4.8,
        ratingsCount: 56,
        sold: 210
      }
    ];

    // Generate 1000 fake products
    const adjectives = ["Ergonomic", "Minimalist", "Premium", "Classic", "Modern", "Vintage", "Industrial", "Smart", "Wireless", "Compact", "Luxury", "Ultimate"];
    const materials = ["Wooden", "Steel", "Aluminum", "Leather", "Cotton", "Plastic", "Glass", "Ceramic", "Titanium", "Carbon Fiber"];
    const productTypes = [
      { type: "Chair", category: "Home Decor", image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=60" },
      { type: "Table", category: "Home Decor", image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&auto=format&fit=crop&q=60" },
      { type: "Lamp", category: "Home Decor", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60" },
      { type: "Headphones", category: "Audio", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60" },
      { type: "Watch", category: "Wearables", image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&auto=format&fit=crop&q=60" },
      { type: "Speaker", category: "Audio", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60" },
      { type: "Keyboard", category: "Electronics", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60" },
      { type: "Smartphone", category: "Electronics", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60" },
      { type: "Earbuds", category: "Audio", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60" },
      { type: "Monitor", category: "Electronics", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60" }
    ];

    for (let i = 1; i <= 1000; i++) {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const mat = materials[Math.floor(Math.random() * materials.length)];
      const prodType = productTypes[Math.floor(Math.random() * productTypes.length)];
      
      const price = Math.floor(Math.random() * 900) + 50; // 50 to 950
      const discount = Math.random() > 0.7 ? Math.floor(price * 0.1) : 0;
      
      productsData.push({
        name: `${adj} ${mat} ${prodType.type} ${i}`,
        description: `Experience the amazing quality of this ${adj.toLowerCase()} ${prodType.type.toLowerCase()}. Made from premium ${mat.toLowerCase()} to ensure long lasting durability and style. Perfect for your everyday needs.`,
        price: price,
        priceAfterDiscount: price - discount,
        quantity: Math.floor(Math.random() * 100) + 1,
        imageCover: prodType.image,
        category: getCatId(prodType.category),
        ratingsAvg: +(Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        ratingsCount: Math.floor(Math.random() * 500),
        sold: Math.floor(Math.random() * 200)
      });
    }

    console.log(`Inserting ${productsData.length} products...`);
    await ProductModel.insertMany(productsData);
    console.log("Products seeded successfully.");

    // Seed Coupons
    console.log("Seeding Coupons...");
    const couponsData = [
      { code: "SAVE20", discount: 20, expireDate: new Date("2027-12-31") },
      { code: "WELCOME10", discount: 10, expireDate: new Date("2027-12-31") }
    ];

    for (const coup of couponsData) {
      await new CouponModel(coup).save();
    }
    console.log("Coupons seeded successfully.");

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
}

seed();
