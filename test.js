require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const { ProductModel } = require('./backend/models/productModel');

mongoose.connect(process.env.DATA_BASE_URL).then(async () => {
  const products = await ProductModel.find({ _id: { $in: ['6a58ebc2fb251ddb03fe4c67'] } });
  console.log(products);
  process.exit(0);
});
