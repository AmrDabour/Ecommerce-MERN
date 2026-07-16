const { UserModel } = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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

//forgot password
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Please provide an email" });

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET || 'your_secret_key',
      { expiresIn: '15m' }
    );

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // Determine the frontend URL based on environment or fallback
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: 'Luxe Store - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your Luxe Store account.</p>
          <p>Click the button below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #0d9488; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          <p style="margin-top: 20px;">This link is valid for 15 minutes.</p>
          <p style="color: #777; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).json({ msg: "Failed to send reset email", error: err });
  }
}

//reset password
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ msg: "Token and new password are required" });

  try {
    const decoded = jwt.verify(token, process.env.SECRET || 'your_secret_key');
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ msg: "Reset token has expired" });
    }
    res.status(500).json({ msg: "Failed to reset password", error: err });
  }
}

module.exports = { getUsers, getUserById, addUser, login, updateUser, deleteUser, forgotPassword, resetPassword };
