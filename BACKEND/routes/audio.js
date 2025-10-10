const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Check if user can upload audio (verified via OTP and within time range)
const checkAudioUploadPermission = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Check if user has verified email for audio upload (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!user.audioUploadVerified || user.audioUploadVerified < oneHourAgo) {
      return res.status(403).json({
        message: 'Please verify your email before uploading audio'
      });
    }
    
    // Check time restriction (2pm-7pm IST)
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hours = istTime.getUTCHours();
    
    if (hours < 14 || hours >= 19) {
      return res.status(403).json({
        message: 'Audio uploads are only allowed between 2:00 PM to 7:00 PM IST'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload audio tweet
router.post('/upload', auth, checkAudioUploadPermission, async (req, res) => {
  try {
    const { audioData, duration } = req.body;
    
    // Validate audio data
    if (!audioData || !duration) {
      return res.status(400).json({
        message: 'Audio data and duration are required'
      });
    }
    
    // Validate duration (max 5 minutes = 300 seconds)
    if (duration > 300) {
      return res.status(400).json({
        message: 'Audio duration cannot exceed 5 minutes'
      });
    }
    
    // In a real app, you would save the audio file to storage (AWS S3, etc.)
    // For demo purposes, we'll store the base64 data directly
    const audioUrl = audioData; // This would be the actual file URL in production
    
    res.json({
      message: 'Audio uploaded successfully',
      audioUrl,
      duration
    });
    
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({
      message: 'Failed to upload audio',
      error: error.message
    });
  }
});

module.exports = router;