const db = require('../models');
const User = db.users;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');
const crypto = require('crypto');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Store OTPs with expiry (in memory for simplicity, use Redis in production)
const otpStore = {};

// Signup controller
exports.signup = async (req, res) => {
  try {
    // Validate request
    const { name, email, password, address, role } = req.body;
    if (!name || !email || !password || !address) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use!" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: role || 'customer' // Default to customer if not specified
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ message: err.message || "Some error occurred during registration." });
  }
};

// Signin controller
exports.signin = async (req, res) => {
  try {
    // Validate request
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required!" });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Some error occurred during login." });
  }
};

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate request
    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Generate OTP (6 digits)
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP with 10 minute expiry
    otpStore[email] = {
      otp,
      expiry: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    // Send OTP via email
    await emailService.sendOTP(email, otp);

    res.status(200).json({ 
      message: "OTP sent to your email!",
      email: email
    });
  } catch (err) {
    console.error('Error during password reset request:', err);
    res.status(500).json({ message: err.message || "Error processing your request." });
  }
};

// Verify OTP and reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Validate request
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP and new password are required!" });
    }

    // Check if OTP exists and is valid
    if (!otpStore[email] || otpStore[email].otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP!" });
    }

    // Check if OTP is expired
    if (Date.now() > otpStore[email].expiry) {
      delete otpStore[email]; // Clean up expired OTP
      return res.status(400).json({ message: "OTP expired!" });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await user.update({ password: hashedPassword });

    // Clean up used OTP
    delete otpStore[email];

    res.status(200).json({ message: "Password reset successful!" });
  } catch (err) {
    console.error('Error during password reset:', err);
    res.status(500).json({ message: err.message || "Error processing your request." });
  }
};

