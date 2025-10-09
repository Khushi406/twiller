const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      name,
      username,
      email,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        verified: user.verified,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for email:', email);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User found:', user.email);

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Password match successful for:', email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        verified: user.verified,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed',
      error: error.message 
    });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      message: 'Failed to get user',
      error: error.message 
    });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile',
      error: error.message 
    });
  }
});

// Password reset functionality
router.post('/forgot-password', async (req, res) => {
  try {
    const { method, value } = req.body;
    
    // Check if user has already requested password reset today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let user;
    if (method === 'email') {
      user = await User.findOne({ email: value });
    } else if (method === 'phone') {
      user = await User.findOne({ phone: value });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already requested today
    if (user.lastPasswordResetRequest) {
      const lastRequest = new Date(user.lastPasswordResetRequest);
      lastRequest.setHours(0, 0, 0, 0);
      
      if (lastRequest.getTime() === today.getTime()) {
        return res.status(429).json({ 
          message: 'You have already requested password reset today. Please try again tomorrow.' 
        });
      }
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP and reset request timestamp
    user.passwordResetOTP = otp;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.lastPasswordResetRequest = new Date();
    await user.save();
    
    // In a real app, you would send email/SMS here
    console.log(`Password reset OTP for ${value}: ${otp}`);
    
    res.json({
      message: `Password reset code sent to your ${method}. Check console for OTP (in development).`
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Failed to process password reset request',
      error: error.message 
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { method, value, otp, newPassword } = req.body;
    
    let user;
    if (method === 'email') {
      user = await User.findOne({ email: value });
    } else if (method === 'phone') {
      user = await User.findOne({ phone: value });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if OTP is valid and not expired
    if (!user.passwordResetOTP || user.passwordResetOTP !== otp) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return res.status(400).json({ message: 'Reset code has expired' });
    }
    
    // Update password
    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    res.json({
      message: 'Password reset successfully'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Failed to reset password',
      error: error.message 
    });
  }
});

module.exports = router;