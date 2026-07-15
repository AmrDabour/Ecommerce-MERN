const { UserModel } = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//get all users
function getUsers(req, res) {
  UserModel.find()
    .then((data) => {
      res.status(200).json({ msg: "users fetched successfully", data: data });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ msg: "Error handling fetching users", error: err });
    });
}

//get user by id
function getUserById(req, res) {
  UserModel.findById(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "user not found" });
      }
      res.status(200).json({ msg: "user fetched successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error fetching user", error: err });
    });
}

//register new user
function addUser(req, res) {
  let newUser = req.body;

  UserModel.create(newUser)
    .then((data) => {
      res.status(201).json({ msg: "user registered successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error registering user", error: err });
    });
}

//login user
function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "please enter email & password" });
  }

  UserModel.findOne({ email: email })
    .then((userInDB) => {
      if (!userInDB) {
        return res.status(401).json({ msg: "invalid email or password" });
      }

      return bcrypt
        .compare(password, userInDB.password)
        .then((isValid) => {
          if (!isValid) {
            return res.status(401).json({ msg: "invalid email or password" });
          }
          //generate token with role included
          const token = jwt.sign(
            { id: userInDB._id, email: userInDB.email, role: userInDB.role },
            process.env.SECRET,
          );
          res.status(200).json({ msg: "login successfully", token: token });
        })
        .catch((err) => {
          console.log(err);
          res.status(401).json({ msg: "invalid email or password" });
        });
    })
    .catch((err) => {
      console.log("err while filter email", err);
      res.status(500).json({ msg: "err while filter email", error: err });
    });
}

//update user
function updateUser(req, res) {
  UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "user not found" });
      }
      res.status(200).json({ msg: "user updated successfully", data: data });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error updating user", error: err });
    });
}

//delete user
function deleteUser(req, res) {
  UserModel.findByIdAndDelete(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ msg: "user not found" });
      }
      res.status(200).json({ msg: "user deleted successfully" });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error deleting user", error: err });
    });
}

module.exports = { getUsers, getUserById, addUser, login, updateUser, deleteUser };
