const express = require('express');
const UAParser = require('ua-parser-js');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');

console.log("Loaded auth.js");
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
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Create new user
    const user = new User({ name, username, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });

  } catch (error) {
    console.error('Register error:', error);
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

  // Parse user agent and IP
  const userAgent = req.headers['user-agent'] || '';
  const parser = new UAParser(userAgent);
  const uaResult = parser.getResult();
  const browser = uaResult.browser.name || 'Unknown';
  const os = uaResult.os.name || 'Unknown';
  const deviceType = uaResult.device.type || 'desktop';
  // Get IP address
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || req.ip || '';

  // Find user by email
  const user = await User.findOne({ email });
  // For debugging, log detected info
  console.log(`Login attempt: email=${email}, browser=${browser}, os=${os}, deviceType=${deviceType}, ip=${ip}`);
    if (!user) {
      console.log('❌ User not found with email:', email);
      // Log failed attempt
      // We don't have a user object to update, so we can't log this attempt against a user.
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User found:', user.email);

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch for user:', email);
      // Log failed attempt
      user.loginHistory.push({ ip, browser, os, otpRequired: false, success: false });
      await user.save();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Password match successful for:', email);

    // Time and OTP logic
    let otpRequired = false;
    let timeAllowed = true;
    // Restrict all mobile devices (deviceType === 'mobile') to 10AM-1PM IST
    if (deviceType === 'mobile' || os === 'Android' || os === 'iOS') {
      // Only allow 10 AM - 1 PM IST
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const ist = new Date(now.getTime() + istOffset);
      const hour = ist.getUTCHours(); // This is IST hour because of the offset
      if (hour < 4 || hour > 7) { // 10-13 IST == 4-7 UTC
        timeAllowed = false;
      }
    }
    // Chrome: require OTP
    if (browser === 'Chrome') {
      otpRequired = true;
      const otp = generateOTP();
      user.loginOTP = otp;
      user.loginOTPExpires = Date.now() + 10 * 60 * 1000; // 10 min expiry
      await sendOTPEmail(user.email, otp, 'Chrome login');
      // Log login attempt (pending OTP)
      user.loginHistory.push({
        date: new Date(),
        ip,
        browser,
        os,
        deviceType,
        otpRequired: true,
        success: false
      });
      await user.save();
      // Respond with OTP required, do not issue token yet
      return res.status(200).json({
        message: 'OTP required for Chrome login. OTP sent to your email.',
        otpRequired: true
      });
    }

    // Edge: explicitly allow direct login (no OTP)
    if (browser === 'Edge') {
      otpRequired = false;
      // Log login attempt
      user.loginHistory.push({
        date: new Date(),
        ip,
        browser,
        os,
        deviceType,
        otpRequired: false,
        success: timeAllowed
      });
      await user.save();
      if (!timeAllowed) {
        return res.status(403).json({ message: 'Mobile login allowed only between 10 AM and 1 PM IST' });
      }
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
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
          createdAt: user.createdAt,
          otpRequired: false
        }
      });
    }

    // Log login attempt
    user.loginHistory.push({
      date: new Date(),
      ip,
      browser,
      os,
      deviceType,
      otpRequired,
      success: timeAllowed
    });
    await user.save();

    if (!timeAllowed) {
      return res.status(403).json({ message: 'Mobile login allowed only between 10 AM and 1 PM IST' });
    }

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
        createdAt: user.createdAt,
        otpRequired
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

// Verify Chrome login OTP (must be at top level, not inside /login)
console.log("Registering /verify-login-otp");
router.post('/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Parse user agent and IP for logging
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();
    const browser = uaResult.browser.name || 'Unknown';
    const os = uaResult.os.name || 'Unknown';
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || req.ip || '';

    const user = await User.findOne({ email });
    if (!user || !user.loginOTP || !user.loginOTPExpires) {
      return res.status(400).json({ message: 'OTP verification failed' });
    }
    if (user.loginOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (user.loginOTPExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    // OTP valid, clear fields
    user.loginOTP = undefined;
    user.loginOTPExpires = undefined;
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Find the pending Chrome login and update it to success: true
    const pendingLogin = user.loginHistory.slice().reverse().find(
      (h) => h.browser === 'Chrome' && h.otpRequired && !h.success
    );
    if (pendingLogin) {
      pendingLogin.success = true;
    } else {
      // Or, push a new record if one isn't found
      user.loginHistory.push({
        date: new Date(),
        ip,
        browser,
        os,
        otpRequired: true,
        success: true,
      });
    }
    await user.save();
    res.json({
      message: 'OTP verified, login successful',
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
    console.error('Verify login OTP error:', error);
    res.status(500).json({
      message: 'OTP verification failed',
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

// Get current user's login history
router.get('/login-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('loginHistory');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ loginHistory: user.loginHistory });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({
      message: 'Failed to get login history',
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

// Send audio upload OTP
router.post('/send-audio-otp', auth, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user is authenticated
    if (!req.user) {
      console.error('Audio OTP error: req.user is undefined');
      return res.status(401).json({ 
        message: 'User not authenticated' 
      });
    }

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }
    
    // Verify the email belongs to the authenticated user
    if (email !== req.user.email) {
      return res.status(403).json({ 
        message: 'You can only verify your own email address' 
      });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    
    // Set OTP expiry (10 minutes)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    // Update user with audio OTP
    await User.findByIdAndUpdate(req.user._id, {
      audioUploadOTP: otp,
      audioUploadOTPExpires: otpExpiry
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, 'audio upload');
    
    if (emailResult.success) {
      console.log(`Audio Upload OTP sent to ${email}: ${otp}`);
      res.json({
        message: 'OTP sent successfully to your email'
      });
    } else {
      // Fallback - log OTP to console for demo purposes
      console.log(`Email failed, Audio Upload OTP for ${email}: ${otp}`);
      res.json({
        message: 'OTP generated (check console for demo)',
        demo_otp: otp // Remove this in production
      });
    }
    
  } catch (error) {
    console.error('Send audio OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
});

// Verify audio upload OTP
router.post('/verify-audio-otp', auth, async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Verify the email belongs to the authenticated user
    if (email !== req.user.email) {
      return res.status(403).json({ 
        message: 'You can only verify your own email address' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user.audioUploadOTP || user.audioUploadOTP !== otp) {
      return res.status(400).json({ 
        message: 'Invalid OTP' 
      });
    }
    
    if (user.audioUploadOTPExpires < new Date()) {
      return res.status(400).json({ 
        message: 'OTP has expired' 
      });
    }
    
    // Clear OTP and mark as verified for current session
    await User.findByIdAndUpdate(req.user._id, {
      audioUploadOTP: undefined,
      audioUploadOTPExpires: undefined,
      audioUploadVerified: new Date() // Valid for current session
    });
    
    res.json({
      message: 'Email verified successfully for audio upload'
    });
    
  } catch (error) {
    console.error('Verify audio OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to verify OTP',
      error: error.message 
    });
  }
});

// Get notification settings
router.get('/notification-settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationSettings');
    
    res.json({
      notificationSettings: user.notificationSettings || {
        enabled: true,
        keywords: ['cricket', 'science'],
        browserPermissionGranted: false
      }
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ 
      message: 'Failed to get notification settings',
      error: error.message 
    });
  }
});

// Update notification settings
router.put('/notification-settings', auth, async (req, res) => {
  try {
    const { notificationSettings } = req.body;
    
    if (!notificationSettings) {
      return res.status(400).json({ 
        message: 'Notification settings are required' 
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { notificationSettings },
      { new: true, runValidators: true }
    ).select('notificationSettings');

    res.json({
      message: 'Notification settings updated successfully',
      notificationSettings: updatedUser.notificationSettings
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ 
      message: 'Failed to update notification settings',
      error: error.message 
    });
  }
});

module.exports = router;