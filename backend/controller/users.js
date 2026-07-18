const { UserModel } = require("../models/userModel.js");
const { CouponModel } = require("../models/couponModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email.js");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

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
async function addUser(req, res) {
  let newUser = req.body;
  const passedReferralCode = req.body.referralCode;

  try {
    let referrer = null;
    if (passedReferralCode) {
      referrer = await UserModel.findOne({ referralCode: passedReferralCode.toUpperCase() });
      if (referrer) {
        newUser.referredBy = referrer._id;
      }
      // Remove it from the payload so we don't try to assign the referrer's code to the new user
      delete newUser.referralCode;
    }

    const createdUser = await UserModel.create(newUser);

    if (referrer) {
      // Increment referrer's count
      referrer.referralCount += 1;
      await referrer.save();

      // Create 10% coupon for referrer
      await CouponModel.create({
        code: `REF-RWD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        discount: 10,
        expireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdFor: referrer._id,
        usageLimit: 1,
        type: 'referral_reward'
      });

      // Create 5% coupon for the new user
      await CouponModel.create({
        code: `WEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        discount: 5,
        expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdFor: createdUser._id,
        usageLimit: 1,
        type: 'referral_welcome'
      });
    }

    res.status(201).json({ msg: "user registered successfully", data: createdUser });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ msg: "Error registering user", error: err });
  }
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

    // Determine the frontend URL based on environment or fallback
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      email: user.email,
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
    });
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

//google login
async function googleLogin(req, res) {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ msg: "idToken is required" });

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    // Check if user exists
    let userInDB = await UserModel.findOne({ email: email });

    if (!userInDB) {
      // Create new user with random password
      const randomPassword = crypto.randomBytes(16).toString('hex');
      userInDB = await UserModel.create({
        name: name,
        email: email,
        password: randomPassword
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userInDB._id, email: userInDB.email, role: userInDB.role },
      process.env.SECRET,
    );
    
    res.status(200).json({ msg: "Google login successful", token: token, user: userInDB });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ msg: "Invalid Google Token", error: error.message });
  }
}

// Convert points to wallet balance
async function convertPointsToWallet(req, res) {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const { pointsToConvert } = req.body;
    if (!pointsToConvert || pointsToConvert <= 0) {
      return res.status(400).json({ msg: "Invalid points amount" });
    }

    if (user.points < pointsToConvert) {
      return res.status(400).json({ msg: "Not enough points" });
    }

    // Conversion rate: e.g., 100 points = 5 currency
    const conversionRate = 5 / 100;
    const addedBalance = pointsToConvert * conversionRate;

    user.points -= pointsToConvert;
    user.walletBalance += addedBalance;

    await user.save();

    res.status(200).json({ 
      msg: `Successfully converted ${pointsToConvert} points to ${addedBalance} balance`, 
      walletBalance: user.walletBalance,
      points: user.points
    });
  } catch (err) {
    console.error("Error converting points:", err);
    res.status(500).json({ msg: "Error converting points", error: err.message });
  }
}

// Add wallet balance to user (Admin only)
async function addWalletBalance(req, res) {
  try {
    const { userId, amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.walletBalance += amount;
    await user.save();

    res.status(200).json({ 
      msg: `Successfully added ${amount} to user's wallet`, 
      walletBalance: user.walletBalance 
    });
  } catch (err) {
    console.error("Error adding wallet balance:", err);
    res.status(500).json({ msg: "Error adding wallet balance", error: err.message });
  }
}

module.exports = { 
  addUser, 
  getUsers, 
  getUserById, 
  login, 
  updateUser, 
  deleteUser, 
  forgotPassword, 
  resetPassword, 
  googleLogin,
  convertPointsToWallet,
  addWalletBalance
};
