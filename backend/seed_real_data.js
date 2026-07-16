const mongoose = require('mongoose');
const { ProductModel } = require('./models/productModel.js');
const { CategoryModel } = require('./models/categoryModel.js');
const { OrderModel } = require('./models/orderModel.js');
const { CartModel } = require('./models/cartModel.js');

const DB_URL = process.env.DATA_BASE_URL || 'mongodb://mongodb:27017/ecommerce';

async function seedRealData() {
  try {
    console.log('Connecting to MongoDB at', DB_URL);
    await mongoose.connect(DB_URL);
    console.log('✅ Connected to MongoDB');

    // 1. Clear existing products and categories
    console.log('Clearing existing categories, products, carts, and orders...');
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await OrderModel.deleteMany({});
    await CartModel.deleteMany({});
    console.log('🗑️  Existing data cleared.');

    // 2. Fetch real products from DummyJSON
    console.log('Fetching realistic products from DummyJSON...');
    const response = await fetch('https://dummyjson.com/products?limit=150');
    const data = await response.json();
    const fetchedProducts = data.products;
    console.log(`📦 Fetched ${fetchedProducts.length} products from API.`);

    // 3. Extract unique categories and save them
    console.log('Extracting and saving categories...');
    const uniqueCategories = [...new Set(fetchedProducts.map(p => p.category))];
    const categoryDocs = [];

    for (const catName of uniqueCategories) {
      // Create a nice name and dummy image for the category
      const formattedName = catName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const catDoc = await CategoryModel.create({
        name: formattedName,
        description: `Explore our collection of ${formattedName}`,
        // Using a generic placeholder image for categories or mapping to unsplash
        image: `https://source.unsplash.com/400x300/?${encodeURIComponent(formattedName)}`,
      });
      categoryDocs.push(catDoc);
    }
    console.log(`✅ Saved ${categoryDocs.length} categories.`);

    // Create a map for quick category lookup by name
    const categoryMap = {};
    categoryDocs.forEach(cat => {
      categoryMap[cat.name.toLowerCase().replace(/ /g, '-')] = cat._id;
    });

    // 4. Map and save products
    console.log('Mapping and saving products...');
    const productDocs = fetchedProducts.map(p => {
      // Match with the category we created
      const catId = categoryMap[p.category.toLowerCase().replace(/ /g, '-')];
      
      return {
        name: p.title,
        description: p.description,
        price: p.price,
        priceAfterDiscount: p.discountPercentage ? p.price - (p.price * (p.discountPercentage / 100)) : p.price,
        quantity: p.stock > 0 ? p.stock : 50,
        imageCover: p.thumbnail,
        images: p.images.slice(0, 4), // keep up to 4 images
        category: catId,
        ratingsAvg: p.rating,
        ratingsCount: Math.floor(Math.random() * 500) + 10,
        sold: Math.floor(Math.random() * 200),
      };
    });

    await ProductModel.insertMany(productDocs);
    console.log(`✅ Successfully seeded ${productDocs.length} real products!`);

    console.log('🎉 Data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
    process.exit(0);
  }
}

seedRealData();
