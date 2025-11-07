const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const auth = require('../middleware/auth');
const { generateOTP, sendOTPEmail, sendNewPasswordEmail } = require('../utils/emailService');
const { generateOTP: generateSMSOTP, sendOTPSMS, sendNewPasswordSMS } = require('../utils/smsService');
const { parseDeviceInfo, determineAuthRequirements } = require('../utils/deviceDetector');

console.log("Loaded auth.js");
const router = express.Router();

/**
 * Generate a random password with only uppercase and lowercase letters
 * No special characters or numbers allowed
 * @param {number} length - Length of the password (default: 12)
 * @returns {string} - Generated password
 */
function generateRandomPassword(length = 12) {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const allLetters = uppercaseLetters + lowercaseLetters;
  
  let password = '';
  
  // Ensure at least one uppercase and one lowercase letter
  password += uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
  password += lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)];
  
  // Fill the rest with random letters
  for (let i = 2; i < length; i++) {
    password += allLetters[Math.floor(Math.random() * allLetters.length)];
  }
  
  // Shuffle the password to randomize the position of guaranteed uppercase/lowercase
  password = password.split('').sort(() => Math.random() - 0.5).join('');
  
  return password;
}

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

// Login user with device tracking and conditional OTP
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Parse device information
    const deviceInfo = parseDeviceInfo(req);
    console.log('📱 Device Info:', {
      browser: deviceInfo.browser.fullName,
      os: deviceInfo.os.name,
      device: deviceInfo.device.type,
      ip: deviceInfo.ipAddress
    });

    // Determine authentication requirements
    const authReq = determineAuthRequirements(deviceInfo);
    console.log('🔐 Auth Requirements:', authReq);

    // Check if access is allowed (time restriction for mobile)
    if (!authReq.allowed) {
      // Log failed login attempt
      await LoginHistory.create({
        userId: user._id,
        ipAddress: deviceInfo.ipAddress,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        device: deviceInfo.device,
        userAgent: deviceInfo.userAgent,
        loginTime: new Date(),
        loginStatus: 'time_restricted',
        authMethod: 'direct'
      });

      return res.status(403).json({
        success: false,
        message: authReq.reason,
        restriction: authReq.restriction,
        deviceInfo: {
          browser: deviceInfo.browser.fullName,
          os: deviceInfo.os.name,
          device: deviceInfo.device.type,
          timeRestriction: 'Mobile access allowed only between 10 AM - 1 PM'
        }
      });
    }

    // If OTP is required (Chrome browser)
    if (authReq.requiresOTP) {
      // Generate OTP
      const otp = generateOTP();
      
      // Save OTP to user (expires in 10 minutes)
      user.loginOTP = otp;
      user.loginOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
      
      // Generate temporary token for OTP verification
      const tempToken = jwt.sign(
        { userId: user._id, type: 'login_otp' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );
      
      // Store pending login session
      user.pendingLoginSession = {
        token: tempToken,
        deviceInfo: deviceInfo,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      };
      
      await user.save();

      // Send OTP via email
      try {
        await sendOTPEmail(user.email, otp, 'Login Verification');
        console.log('✅ Login OTP sent to:', user.email);
      } catch (emailError) {
        console.error('❌ Failed to send login OTP:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification code. Please try again.'
        });
      }

      // Log OTP required attempt
      await LoginHistory.create({
        userId: user._id,
        ipAddress: deviceInfo.ipAddress,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        device: deviceInfo.device,
        userAgent: deviceInfo.userAgent,
        loginTime: new Date(),
        loginStatus: 'otp_required',
        authMethod: 'otp_email'
      });

      return res.json({
        success: true,
        requiresOTP: true,
        message: authReq.reason,
        tempToken: tempToken,
        email: user.email,
        deviceInfo: {
          browser: deviceInfo.browser.fullName,
          os: deviceInfo.os.name,
          device: deviceInfo.device.type
        }
      });
    }

    // Direct login allowed (Microsoft Edge)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log successful login
    await LoginHistory.create({
      userId: user._id,
      ipAddress: deviceInfo.ipAddress,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      device: deviceInfo.device,
      userAgent: deviceInfo.userAgent,
      loginTime: new Date(),
      loginStatus: 'success',
      authMethod: 'direct'
    });

    return res.json({
      success: true,
      requiresOTP: false,
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
      },
      deviceInfo: {
        browser: deviceInfo.browser.fullName,
        os: deviceInfo.os.name,
        device: deviceInfo.device.type
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Verify login OTP
router.post('/verify-login-otp', async (req, res) => {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Temporary token and OTP are required'
      });
    }

    // Verify temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (decoded.type !== 'login_otp') {
        return res.status(400).json({
          success: false,
          message: 'Invalid token type'
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP is valid
    if (!user.loginOTP || user.loginOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (!user.loginOTPExpires || user.loginOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please login again.'
      });
    }

    // Check pending login session
    if (!user.pendingLoginSession || !user.pendingLoginSession.token) {
      return res.status(400).json({
        success: false,
        message: 'No pending login session found'
      });
    }

    // Generate final JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Get device info from pending session
    const deviceInfo = user.pendingLoginSession.deviceInfo;

    // Clear OTP and pending session
    user.loginOTP = undefined;
    user.loginOTPExpires = undefined;
    user.loginOTPVerified = new Date();
    user.pendingLoginSession = undefined;
    await user.save();

    // Log successful OTP verified login
    await LoginHistory.create({
      userId: user._id,
      ipAddress: deviceInfo.ipAddress,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      device: deviceInfo.device,
      userAgent: deviceInfo.userAgent,
      loginTime: new Date(),
      loginStatus: 'success',
      authMethod: 'otp_email'
    });

    console.log('✅ Login OTP verified successfully for:', user.email);

    return res.json({
      success: true,
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
    console.error('Verify login OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
});

// Resend login OTP
router.post('/resend-login-otp', async (req, res) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: 'Temporary token is required'
      });
    }

    // Verify temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (decoded.type !== 'login_otp') {
        return res.status(400).json({
          success: false,
          message: 'Invalid token type'
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.loginOTP = otp;
    user.loginOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(user.email, otp, 'Login Verification');
      console.log('✅ Login OTP resent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to resend login OTP:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to resend verification code'
      });
    }

    return res.json({
      success: true,
      message: 'New verification code sent to your email'
    });

  } catch (error) {
    console.error('Resend login OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

// Get login history for current user
router.get('/login-history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log('📊 Fetching login history for userId:', req.userId);
    console.log('📊 Query params:', { page, limit, skip });
    
    const history = await LoginHistory.find({ userId: req.userId })
      .sort({ loginTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await LoginHistory.countDocuments({ userId: req.userId });
    
    console.log('📊 Login history results:', {
      userId: req.userId,
      total,
      fetched: history.length,
      page,
      limit,
      historyData: history
    });
    
    if (history.length === 0) {
      console.log('⚠️ No login history found for this user');
      console.log('💡 User needs to log out and log in again to create history entries');
    }

    // Format the response
    const formattedHistory = history.map(entry => ({
      id: entry._id,
      browser: entry.browser.fullName,
      browserVersion: entry.browser.version,
      os: `${entry.os.name} ${entry.os.version}`,
      device: entry.device.type,
      deviceVendor: entry.device.vendor,
      deviceModel: entry.device.model,
      ipAddress: entry.ipAddress,
      loginTime: entry.loginTime,
      loginStatus: entry.loginStatus,
      authMethod: entry.authMethod,
      location: entry.location,
      sessionDuration: entry.sessionDuration,
      logoutTime: entry.logoutTime
    }));

    res.json({
      success: true,
      history: formattedHistory,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch login history',
      error: error.message
    });
  }
});

// Get current login session info
router.get('/current-session', auth, async (req, res) => {
  try {
    const deviceInfo = parseDeviceInfo(req);

    res.json({
      success: true,
      session: {
        browser: deviceInfo.browser.fullName,
        browserVersion: deviceInfo.browser.version,
        os: `${deviceInfo.os.name} ${deviceInfo.os.version}`,
        device: deviceInfo.device.type,
        deviceVendor: deviceInfo.device.vendor,
        deviceModel: deviceInfo.device.model,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent
      }
    });

  } catch (error) {
    console.error('Get current session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session info',
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

    // Validate input
    if (!method || !value) {
      return res.status(400).json({ message: 'Method and value are required' });
    }

    if (!['email', 'phone'].includes(method)) {
      return res.status(400).json({ message: 'Invalid reset method. Use email or phone.' });
    }

    let user;
    if (method === 'email') {
      user = await User.findOne({ email: value });
    } else if (method === 'phone') {
      user = await User.findOne({ phone: value });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has already requested password reset today (24-hour window)
    if (user.lastPasswordResetRequest) {
      const lastRequest = new Date(user.lastPasswordResetRequest);
      const now = new Date();
      const timeDiff = now.getTime() - lastRequest.getTime();
      const hoursDiff = timeDiff / (1000 * 3600); // Convert to hours

      if (hoursDiff < 24) {
        const remainingHours = Math.ceil(24 - hoursDiff);
        return res.status(429).json({
          message: `You have already requested password reset today. Please try again in ${remainingHours} hour(s).`,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: remainingHours * 3600 // seconds
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
    
    // Send OTP via email or SMS
    try {
      if (method === 'email') {
        const emailResult = await sendOTPEmail(user.email, otp, 'password reset');
        
        if (!emailResult.success) {
          console.error('❌ Failed to send password reset OTP email:', emailResult.error);
          return res.status(200).json({
            message: `Password reset OTP generated. Check console (email failed).`,
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
          });
        }
        
        console.log(`✅ Password reset OTP sent to ${user.email}`);
      } else if (method === 'phone') {
        const smsResult = await sendOTPSMS(user.phone, otp, 'password reset');
        
        if (!smsResult.success) {
          console.error('❌ Failed to send password reset OTP SMS:', smsResult.error);
          return res.status(200).json({
            message: `Password reset OTP generated. Check console (SMS failed).`,
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
          });
        }
        
        console.log(`✅ Password reset OTP sent to ${user.phone}`);
      }
      
      res.json({
        message: `Password reset code sent to your ${method}.`,
        maskedValue: method === 'email' 
          ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
          : user.phone.replace(/(\d{2})(.*)(\d{2})/, '$1***$3')
      });
    } catch (sendError) {
      console.error('❌ Error sending password reset OTP:', sendError);
      res.status(200).json({
        message: `Password reset OTP generated (send failed, check console).`,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }
    
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
    const { method, value, otp } = req.body;
    
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
    
    // Generate a random password (uppercase and lowercase letters only)
    const newPassword = generateRandomPassword(12);
    
    // Update password
    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // Send new password via email or SMS
    try {
      if (method === 'email') {
        const emailResult = await sendNewPasswordEmail(user.email, newPassword, user.name);
        
        if (!emailResult.success) {
          console.error('❌ Failed to send new password email:', emailResult.error);
        } else {
          console.log(`✅ New password sent to ${user.email}`);
        }
      } else if (method === 'phone') {
        const smsResult = await sendNewPasswordSMS(user.phone, newPassword, user.name);
        
        if (!smsResult.success) {
          console.error('❌ Failed to send new password SMS:', smsResult.error);
        } else {
          console.log(`✅ New password sent to ${user.phone}`);
        }
      }
    } catch (sendError) {
      console.error('❌ Error sending new password:', sendError);
      // Don't fail the reset if notification fails
    }
    
    res.json({
      message: 'Password reset successfully. A new password has been sent to your email/phone.',
      newPassword: process.env.NODE_ENV === 'development' ? newPassword : undefined
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

// Send phone verification OTP
router.post('/send-phone-otp', auth, async (req, res) => {
  try {
    const { phone } = req.body;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    // Check if phone is provided
    if (!phone) {
      return res.status(400).json({
        message: 'Phone number is required'
      });
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: 'Invalid phone number format'
      });
    }

    // Generate OTP
    const otp = generateSMSOTP();

    // Set OTP expiry (10 minutes)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with phone OTP
    await User.findByIdAndUpdate(req.user._id, {
      phone: phone,
      phoneOTP: otp,
      phoneOTPExpires: otpExpiry
    });

    // Send OTP via SMS
    const smsResult = await sendOTPSMS(phone, otp);
    if (smsResult.success) {
      console.log(`Phone verification OTP sent to ${phone}: ${otp}`);
      res.json({
        message: 'OTP sent successfully to your phone'
      });
    } else {
      console.log(`SMS failed, Phone verification OTP for ${phone}: ${otp}`);
      res.json({
        message: 'OTP generated (check console for demo)',
        demo_otp: otp
      });
    }

  } catch (error) {
    console.error('Send phone OTP error:', error);
    res.status(500).json({
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// Verify phone OTP
router.post('/verify-phone-otp', auth, async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user.phoneOTP || user.phoneOTP !== otp) {
      return res.status(400).json({
        message: 'Invalid OTP'
      });
    }

    if (user.phoneOTPExpires < new Date()) {
      return res.status(400).json({
        message: 'OTP has expired'
      });
    }

    // Clear OTP and mark phone as verified
    await User.findByIdAndUpdate(req.user._id, {
      phoneOTP: undefined,
      phoneOTPExpires: undefined,
      phoneVerified: true
    });

    res.json({
      message: 'Phone number verified successfully'
    });

  } catch (error) {
    console.error('Verify phone OTP error:', error);
    res.status(500).json({
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

// Send language switch OTP
router.post('/send-language-otp', auth, async (req, res) => {
  try {
    const { language } = req.body;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    // Check if language is provided
    if (!language) {
      return res.status(400).json({
        message: 'Language is required'
      });
    }

    // Validate language
    const supportedLanguages = ['en', 'fr', 'es', 'hi', 'pt', 'zh'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        message: 'Unsupported language'
      });
    }

    // Check if user already has this language set
    // Allow re-verification if switching to the same language (user might want to verify again)
    // This check is informational only, not blocking
    const isAlreadySet = req.user.preferredLanguage === language;
    
    // For French language, require email to be present
    if (language === 'fr') {
      if (!req.user.email) {
        return res.status(403).json({
          message: 'Email address is required to switch to French. Please add an email to your account.',
          requiresEmail: true
        });
      }
      
      // Generate OTP
      const otp = generateOTP();
      
      // Set OTP expiry (10 minutes)
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      
      console.log(`📧 Generating Email OTP for French language switch:`);
      console.log(`- User: ${req.user.email}`);
      console.log(`- OTP: ${otp}`);
      console.log(`- OTP Type: ${typeof otp}`);
      console.log(`- OTP Length: ${otp.length}`);
      console.log(`- Expires at: ${otpExpiry}`);
      
      // Save OTP to user
      await User.findByIdAndUpdate(req.user._id, {
        languageSwitchOTP: otp,
        languageSwitchOTPExpires: otpExpiry
      });
      
      // Send OTP via email
      const result = await sendOTPEmail(req.user.email, otp, `language switch to French`);
      if (result.success) {
        console.log(`✅ Language Switch OTP sent to ${req.user.email}: ${otp}`);
        res.json({
          message: 'OTP sent successfully to your email',
          verificationType: 'email',
          debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
      } else {
        console.log(`⚠️ Email failed, Language Switch OTP for ${req.user.email}: ${otp}`);
        res.json({
          message: 'OTP generated (check console for demo)',
          demo_otp: otp,
          verificationType: 'email'
        });
      }
    } else {
      // For other languages (Spanish, Hindi, Portuguese, Chinese, English), require phone verification
      if (!req.user.phone) {
        return res.status(403).json({
          message: 'Phone number is required to switch to this language. Please add a phone number to your account.',
          requiresPhone: true
        });
      }
      
      // Generate OTP
      const otp = generateSMSOTP();
      
      // Set OTP expiry (10 minutes)
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      
      console.log(`📱 Generating Phone OTP for ${language} language switch:`);
      console.log(`- User Phone: ${req.user.phone}`);
      console.log(`- OTP: ${otp}`);
      console.log(`- OTP Type: ${typeof otp}`);
      console.log(`- OTP Length: ${otp.length}`);
      console.log(`- Expires at: ${otpExpiry}`);
      
      // Save OTP to user
      await User.findByIdAndUpdate(req.user._id, {
        languageSwitchOTP: otp,
        languageSwitchOTPExpires: otpExpiry
      });
      
      // Send OTP via SMS
      const smsResult = await sendOTPSMS(req.user.phone, otp);
      if (smsResult.success) {
        console.log(`✅ Language Switch OTP sent to ${req.user.phone}: ${otp}`);
        res.json({
          message: 'OTP sent successfully to your phone',
          verificationType: 'phone',
          debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
      } else {
        console.log(`⚠️ SMS failed, Language Switch OTP for ${req.user.phone}: ${otp}`);
        res.json({
          message: 'OTP generated (check console for demo)',
          demo_otp: otp,
          verificationType: 'phone'
        });
      }
    }

  } catch (error) {
    console.error('Send language OTP error:', error);
    res.status(500).json({
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// Verify language switch OTP
router.post('/verify-language-otp', auth, async (req, res) => {
  try {
    const { language, otp } = req.body;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    // Validate language
    const supportedLanguages = ['en', 'fr', 'es', 'hi', 'pt', 'zh'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        message: 'Unsupported language'
      });
    }

    const user = await User.findById(req.user._id);

    // Trim and normalize OTP inputs for comparison
    const storedOTP = user.languageSwitchOTP ? user.languageSwitchOTP.toString().trim() : null;
    const providedOTP = otp ? otp.toString().trim() : null;

    // Debug logging
    console.log('OTP Verification Debug:');
    console.log('- Stored OTP:', storedOTP);
    console.log('- Provided OTP:', providedOTP);
    console.log('- Match:', storedOTP === providedOTP);
    console.log('- OTP Expiry:', user.languageSwitchOTPExpires);
    console.log('- Current Time:', new Date());

    if (!storedOTP || storedOTP !== providedOTP) {
      console.log('❌ OTP verification failed: Invalid OTP');
      return res.status(400).json({
        message: 'Invalid OTP',
        debug: {
          hasStoredOTP: !!storedOTP,
          providedLength: providedOTP?.length,
          storedLength: storedOTP?.length
        }
      });
    }

    if (user.languageSwitchOTPExpires < new Date()) {
      console.log('❌ OTP verification failed: OTP expired');
      return res.status(400).json({
        message: 'OTP has expired'
      });
    }

    // Clear OTP and update preferred language
    await User.findByIdAndUpdate(req.user._id, {
      languageSwitchOTP: undefined,
      languageSwitchOTPExpires: undefined,
      preferredLanguage: language,
      languageSwitchVerified: new Date()
    });

    res.json({
      message: 'Language switched successfully',
      preferredLanguage: language
    });

  } catch (error) {
    console.error('Verify language OTP error:', error);
    res.status(500).json({
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

module.exports = router;
