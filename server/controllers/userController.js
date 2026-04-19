const { User } = require('../models/User');
const { signToken } = require('../utils/auth');
const sendMail = require('../utils/emailConfig');
const bcrypt = require("bcrypt");

const getOtpUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const cooldownPeriod = 60; // seconds

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your email address.' });
    }

    const existingUser = await User.findOne({ email });
    
    // Check for cooldown (60 seconds)
    if (existingUser && existingUser.lastOtpSentAt) {
      const timeSinceLastOtp = Math.floor((Date.now() - existingUser.lastOtpSentAt.getTime()) / 1000);
      
      if (timeSinceLastOtp < cooldownPeriod) {
        const remainingTime = cooldownPeriod - timeSinceLastOtp;
        return res.status(429).json({ 
          success: false, 
          message: `OTP already sent. Please wait ${remainingTime} seconds before requesting a new one.`,
          remainingTime
        });
      }
    }

    // After cooldown, generate a NEW OTP (Behavior 4)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (existingUser) {
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      existingUser.lastOtpSentAt = new Date();
      await existingUser.save();
    } else {
      const user = new User({ 
        email, 
        otp, 
        otpExpires,
        lastOtpSentAt: new Date()
      });
      await user.save();
    }

    await sendMail(email, otp);
    res.status(200).json({ 
      success: true, 
      message: 'A new verification code has been sent to your email.',
      remainingTime: cooldownPeriod
    });
  } catch (err) {
    console.error("OTP ERROR:", err);
    next(err);
  }
};

const getOtpStatus = async (req, res, next) => {
  try {
    const { email } = req.body;
    const cooldownPeriod = 60; // seconds

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.lastOtpSentAt) {
      return res.status(200).json({ success: true, remainingTime: 0 });
    }

    const timeSinceLastOtp = Math.floor((Date.now() - user.lastOtpSentAt.getTime()) / 1000);
    const remainingTime = Math.max(0, cooldownPeriod - timeSinceLastOtp);

    res.status(200).json({ 
      success: true, 
      remainingTime,
      isVerified: user.isVerified
    });
  } catch (err) {
    next(err);
  }
};


const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, verificationCode, role } = req.body;
    console.log("REGISTER PAYLOAD:", { username, email, role, verificationCode });

    if (!username || !email || !password || !verificationCode) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No verification record found. Please request an OTP first.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This email is already verified. Please login.' });
    }

    // Check if OTP match
    if (user.otp !== verificationCode) {
      return res.status(400).json({ success: false, message: 'The OTP entered is incorrect. Please try again.' });
    }

    // Check if OTP expired
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'This OTP has expired. Please request a new one.' });
    }

    const isFirstUser = (await User.countDocuments({ isVerified: true })) === 0;

    user.username = username;
    user.password = password; // pre-save hook will hash it
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    user.role = isFirstUser ? 'admin' : (role || 'staff');

    await user.save();

    const token = signToken(user);
    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the Food Bank 👋',
      token,
      data: { id: user._id, username, email, role: user.role }
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    next(err);
  }
};


const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("LOGIN ATTEMPT:", { email });

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    console.log("USER FOUND, COMPARING PASSWORD...");
    const isMatch = await user.isCorrectPassword(password);
    console.log("BCRYPT MATCH RESULT:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your account before logging in.' });
    }

    // Trigger OTP for login as requested in the plan
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.lastOtpSentAt = new Date();
    await user.save();

    await sendMail(email, otp);

    res.status(200).json({ 
      success: true, 
      requiresOtp: true,
      message: 'Credentials verified! A verification code has been sent to your email.' 
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    next(err);
  }
};

const verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, verificationCode } = req.body;
    
    if (!email || !verificationCode) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User session not found.' });
    }

    if (user.otp !== verificationCode) {
      return res.status(401).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(401).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Success - Clear OTP and generate token
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = signToken(user);
    res.status(200).json({ 
      success: true,
      message: 'Login successful! Welcome back 👋',
      token, 
      data: { id: user._id, username: user.username, email: user.email, role: user.role } 
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'username email role createdAt');
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'staff', 'volunteer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role value.' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOtpUser, getOtpStatus, registerUser, loginUser, verifyLoginOtp, getAllUsers, updateUserRole };