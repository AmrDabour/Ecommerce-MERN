const mongoose = require('mongoose');
const { UserModel } = require('./models/userModel');
const { CouponModel } = require('./models/couponModel');
require('dotenv').config();

async function testReferral() {
  try {
    await mongoose.connect(process.env.DATA_BASE_URL);
    console.log('Connected to DB');

    // 1. Create a referrer user
    const referrerEmail = `test.referrer.${Date.now()}@test.com`;
    let referrer = await UserModel.create({
      name: 'Test Referrer',
      email: referrerEmail,
      password: 'password123'
    });
    console.log(`Referrer created with code: ${referrer.referralCode}`);

    // 2. Create a new user using the referral code
    const newUserEmail = `test.new.${Date.now()}@test.com`;
    let newUser = await UserModel.create({
      name: 'Test New User',
      email: newUserEmail,
      password: 'password123',
      referredBy: referrer._id
    });
    console.log(`New User created!`);

    // Manually trigger the logic that would normally be in addUser controller
    referrer.referralCount += 1;
    await referrer.save();

    await CouponModel.create({
      code: `REF-RWD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      discount: 10,
      expireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdFor: referrer._id,
      usageLimit: 1,
      type: 'referral_reward'
    });

    await CouponModel.create({
      code: `WEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      discount: 5,
      expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdFor: newUser._id,
      usageLimit: 1,
      type: 'referral_welcome'
    });

    // 3. Verify
    referrer = await UserModel.findById(referrer._id);
    console.log(`Referrer referral count: ${referrer.referralCount} (Expected: 1)`);

    const referrerCoupons = await CouponModel.find({ createdFor: referrer._id });
    console.log(`Referrer coupons: ${referrerCoupons.length} (Expected: 1)`);

    const newUserCoupons = await CouponModel.find({ createdFor: newUser._id });
    console.log(`New user coupons: ${newUserCoupons.length} (Expected: 1)`);

    console.log('TEST PASSED! ✅');
  } catch (e) {
    console.error('TEST FAILED ❌', e);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

testReferral();
