const { CategoryModel } = require("../models/categoryModel.js");

//get all categories
function getCategories(req, res) {
  CategoryModel.find()
    .then((data) => {
      res.status(200).json({ msg: "categories fetched successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching categories", error: err });
    });
}

//get category by id
function getCategoryById(req, res) {
  CategoryModel.findById(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "category not found" });
      }
      res.status(200).json({ msg: "category fetched successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching category", error: err });
    });
}

//create category
function addCategory(req, res) {
  CategoryModel.create(req.body)
    .then((data) => {
      res.status(201).json({ msg: "category created successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error creating category", error: err });
    });
}

//update category
function updateCategory(req, res) {
  CategoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "category not found" });
      }
      res.status(200).json({ msg: "category updated successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error updating category", error: err });
    });
}

//delete category
function deleteCategory(req, res) {
  CategoryModel.findByIdAndDelete(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "category not found" });
      }
      res.status(200).json({ msg: "category deleted successfully" });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error deleting category", error: err });
    });
}

module.exports = { getCategories, getCategoryById, addCategory, updateCategory, deleteCategory };
