const { ProductModel } = require("../models/productModel.js");

//get all products with filter, sort, pagination
function getProducts(req, res) {
  //copy query and remove special fields
  let queryObj = { ...req.query };
  let removeFields = ["page", "limit", "sort", "keyword"];
  removeFields.forEach((field) => delete queryObj[field]);

  //filter >>price[gte]=50 becomes {price:{$gte:50}}
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => "$" + match);
  queryObj = JSON.parse(queryStr);

  //keyword search
  let keywordSearch = {};
  if (req.query.keyword) {
    keywordSearch = {
      $or: [
        { name: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } }
      ]
    };
  }

  let query = ProductModel.find({ ...queryObj, ...keywordSearch }).populate("category", "name");

  //sort
  if (req.query.sort) {
    let sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //pagination
  let page = req.query.page * 1 || 1;
  let limit = req.query.limit * 1 || 10;
  let skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  query
    .then((data) => {
      res.status(200).json({ msg: "products fetched successfully", page: page, results: data.length, data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching products", error: err });
    });
}

//get product by id
function getProductById(req, res) {
  ProductModel.findById(req.params.id)
    .populate("category", "name")
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "product not found" });
      }
      res.status(200).json({ msg: "product fetched successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching product", error: err });
    });
}

//create product
function addProduct(req, res) {
  ProductModel.create(req.body)
    .then((data) => {
      res.status(201).json({ msg: "product created successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error creating product", error: err });
    });
}

//update product
function updateProduct(req, res) {
  console.log("UPDATE PRODUCT BODY:", JSON.stringify(req.body, null, 2));
  ProductModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "product not found" });
      }
      res.status(200).json({ msg: "product updated successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error updating product", error: err });
    });
}

//delete product
function deleteProduct(req, res) {
  ProductModel.findByIdAndDelete(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "product not found" });
      }
      res.status(200).json({ msg: "product deleted successfully" });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error deleting product", error: err });
    });
}

module.exports = { getProducts, getProductById, addProduct, updateProduct, deleteProduct };
