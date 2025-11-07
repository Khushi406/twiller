const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');
const AudioTweet = require('../models/AudioTweet');
const { upload, handleMulterError } = require('../middleware/audioUpload');
const { validateAudioDuration, getAudioMetadata, formatDuration } = require('../utils/audioValidator');
const { sendOTPEmail } = require('../utils/emailService');

const router = express.Router();

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check IST time (2pm-7pm)
const checkUploadTime = () => {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const hours = istTime.getUTCHours();
  return hours >= 14 && hours < 19;
};

// Format IST time
const getISTTime = () => {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return istTime.toISOString().replace('T', ' ').substring(0, 19) + ' IST';
};

// REQUEST OTP for audio upload
router.post('/request-otp', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.email) {
      return res.status(400).json({ message: 'Email not found. Please add an email to your profile.' });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Set OTP expiry (10 minutes)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    // Save OTP to user
    user.audioUploadOTP = otp;
    user.audioUploadOTPExpires = otpExpiry;
    await user.save();
    
    // Send OTP email
    try {
      const emailResult = await sendOTPEmail(user.email, otp, 'audio upload');
      
      if (!emailResult.success) {
        console.error('❌ Email send failed:', emailResult.error);
      } else {
        console.log(`✅ Audio Upload OTP sent to ${user.email}: ${otp}`);
      }
      
      res.json({
        message: emailResult.success ? 'OTP sent to your email' : 'OTP generated (email failed, check console)',
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
        expiresIn: '10 minutes',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      // Still return success for development/testing
      res.json({
        message: 'OTP generated (email failed, check console)',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        expiresIn: '10 minutes'
      });
    }
    
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// VERIFY OTP for audio upload
router.post('/verify-otp', auth, async (req, res) => {
  try {
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if OTP exists
    if (!user.audioUploadOTP) {
      return res.status(400).json({ message: 'No OTP requested. Please request OTP first.' });
    }
    
    // Check if OTP expired
    if (user.audioUploadOTPExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    
    // Verify OTP
    if (user.audioUploadOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Mark as verified (valid for 1 hour)
    user.audioUploadVerified = new Date();
    user.audioUploadOTP = undefined;
    user.audioUploadOTPExpires = undefined;
    await user.save();
    
    res.json({
      message: 'OTP verified successfully! You can now upload audio.',
      verified: true,
      validFor: '1 hour'
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Check if user can upload audio (verified via OTP and within time range)
const checkAudioUploadPermission = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Check if user has verified email for audio upload (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!user.audioUploadVerified || user.audioUploadVerified < oneHourAgo) {
      return res.status(403).json({
        message: 'Please verify your email before uploading audio. Request OTP first.',
        error: 'OTP_NOT_VERIFIED'
      });
    }
    
    // Check time restriction (2pm-7pm IST)
    if (!checkUploadTime()) {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const currentHour = istTime.getUTCHours();
      
      return res.status(403).json({
        message: 'Audio uploads are only allowed between 2:00 PM to 7:00 PM IST',
        error: 'UPLOAD_TIME_RESTRICTED',
        currentTimeIST: getISTTime(),
        allowedTime: '2:00 PM - 7:00 PM IST'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPLOAD audio tweet
router.post('/upload', 
  auth, 
  checkAudioUploadPermission, 
  upload.single('audio'),
  handleMulterError,
  async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          message: 'No audio file uploaded',
          error: 'NO_FILE'
        });
      }
      
      const filePath = req.file.path;
      const { caption } = req.body;
      
      // Validate audio duration
      console.log('🔍 Validating audio duration...');
      const durationValidation = await validateAudioDuration(filePath, 300); // 5 minutes max
      
      if (!durationValidation.valid) {
        // Delete uploaded file
        fs.unlinkSync(filePath);
        return res.status(400).json({
          message: durationValidation.message,
          error: 'DURATION_EXCEEDED',
          duration: Math.round(durationValidation.duration),
          maxDuration: 300
        });
      }
      
      // Get detailed audio metadata
      console.log('📊 Extracting audio metadata...');
      const metadata = await getAudioMetadata(filePath);
      
      // Create audio tweet record
      const audioTweet = new AudioTweet({
        userId: req.user._id,
        audioUrl: `/api/audio/stream/${req.file.filename}`,
        fileName: req.file.filename,
        filePath: filePath,
        duration: metadata.duration,
        durationFormatted: formatDuration(metadata.duration),
        fileSize: req.file.size,
        fileSizeFormatted: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
        mimeType: req.file.mimetype,
        bitRate: metadata.bitRate,
        sampleRate: metadata.sampleRate,
        channels: metadata.channels,
        codec: metadata.codec,
        caption: caption || '',
        otpVerified: true,
        otpVerifiedAt: new Date(),
        uploadedAt: new Date(),
        uploadTimeIST: getISTTime()
      });
      
      await audioTweet.save();
      
      console.log(`✅ Audio tweet uploaded: ${req.file.filename}`);
      
      res.json({
        message: 'Audio uploaded successfully!',
        audioTweet: {
          id: audioTweet._id,
          audioUrl: audioTweet.audioUrl,
          duration: audioTweet.duration,
          durationFormatted: audioTweet.durationFormatted,
          fileSize: audioTweet.fileSizeFormatted,
          caption: audioTweet.caption,
          uploadedAt: audioTweet.uploadedAt
        }
      });
      
    } catch (error) {
      console.error('❌ Audio upload error:', error);
      
      // Clean up file if it was uploaded
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', cleanupError);
        }
      }
      
      res.status(500).json({
        message: 'Failed to upload audio',
        error: error.message
      });
    }
  }
);

// STREAM audio file
router.get('/stream/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', 'audio', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Audio file not found' });
    }
    
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      // Handle range requests (for audio player seeking)
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Stream entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      };
      
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
    
  } catch (error) {
    console.error('Stream audio error:', error);
    res.status(500).json({ message: 'Error streaming audio', error: error.message });
  }
});

// GET specific audio tweet
router.get('/:id', auth, async (req, res) => {
  try {
    const audioTweet = await AudioTweet.findById(req.params.id)
      .populate('userId', 'name username email avatar')
      .populate('comments.userId', 'name username avatar');
    
    if (!audioTweet || audioTweet.isDeleted) {
      return res.status(404).json({ message: 'Audio tweet not found' });
    }
    
    // Increment view count
    await audioTweet.incrementViews();
    
    res.json({ audioTweet });
    
  } catch (error) {
    console.error('Get audio tweet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET user's audio tweets
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;
    
    const audioTweets = await AudioTweet.getUserAudioTweets(
      userId, 
      parseInt(limit), 
      parseInt(skip)
    );
    
    res.json({
      audioTweets,
      count: audioTweets.length
    });
    
  } catch (error) {
    console.error('Get user audio tweets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET feed audio tweets
router.get('/', async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    
    const audioTweets = await AudioTweet.getFeedAudioTweets(
      parseInt(limit), 
      parseInt(skip)
    );
    
    res.json({
      audioTweets,
      count: audioTweets.length
    });
    
  } catch (error) {
    console.error('Get feed audio tweets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE audio tweet
router.delete('/:id', auth, async (req, res) => {
  try {
    const audioTweet = await AudioTweet.findById(req.params.id);
    
    if (!audioTweet) {
      return res.status(404).json({ message: 'Audio tweet not found' });
    }
    
    // Check if user owns this audio tweet
    if (audioTweet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this audio tweet' });
    }
    
    // Delete the audio file
    try {
      if (fs.existsSync(audioTweet.filePath)) {
        fs.unlinkSync(audioTweet.filePath);
        console.log(`🗑️ Deleted audio file: ${audioTweet.fileName}`);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
    }
    
    // Mark as deleted (soft delete)
    audioTweet.isDeleted = true;
    audioTweet.isActive = false;
    await audioTweet.save();
    
    res.json({ message: 'Audio tweet deleted successfully' });
    
  } catch (error) {
    console.error('Delete audio tweet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// LIKE/UNLIKE audio tweet
router.post('/:id/like', auth, async (req, res) => {
  try {
    const audioTweet = await AudioTweet.findById(req.params.id);
    
    if (!audioTweet || audioTweet.isDeleted) {
      return res.status(404).json({ message: 'Audio tweet not found' });
    }
    
    await audioTweet.toggleLike(req.user._id);
    
    const isLiked = audioTweet.likes.some(id => id.toString() === req.user._id.toString());
    
    res.json({
      message: isLiked ? 'Audio tweet liked' : 'Audio tweet unliked',
      liked: isLiked,
      likesCount: audioTweet.likesCount
    });
    
  } catch (error) {
    console.error('Like audio tweet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADD comment to audio tweet
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    
    if (text.length > 280) {
      return res.status(400).json({ message: 'Comment cannot exceed 280 characters' });
    }
    
    const audioTweet = await AudioTweet.findById(req.params.id);
    
    if (!audioTweet || audioTweet.isDeleted) {
      return res.status(404).json({ message: 'Audio tweet not found' });
    }
    
    await audioTweet.addComment(req.user._id, text);
    
    // Populate the new comment
    await audioTweet.populate('comments.userId', 'name username avatar');
    
    res.json({
      message: 'Comment added successfully',
      comment: audioTweet.comments[audioTweet.comments.length - 1],
      commentsCount: audioTweet.commentsCount
    });
    
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;