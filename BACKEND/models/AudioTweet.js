const mongoose = require('mongoose');

const audioTweetSchema = new mongoose.Schema({
  // User who created the audio tweet
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Audio file information
  audioUrl: {
    type: String,
    required: true
  },
  
  fileName: {
    type: String,
    required: true
  },
  
  filePath: {
    type: String,
    required: true
  },
  
  // Audio metadata
  duration: {
    type: Number, // in seconds
    required: true,
    max: 300 // 5 minutes max
  },
  
  durationFormatted: {
    type: String // MM:SS format
  },
  
  fileSize: {
    type: Number, // in bytes
    required: true,
    max: 100 * 1024 * 1024 // 100MB max
  },
  
  fileSizeFormatted: {
    type: String // e.g., "2.5 MB"
  },
  
  mimeType: {
    type: String,
    required: true
  },
  
  // Audio technical details
  bitRate: Number,
  sampleRate: Number,
  channels: Number,
  codec: String,
  
  // Tweet content
  caption: {
    type: String,
    maxlength: 280,
    default: ''
  },
  
  // OTP verification tracking
  otpVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  
  otpVerifiedAt: {
    type: Date
  },
  
  // Upload time tracking
  uploadedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  uploadTimeIST: {
    type: String // formatted IST time for reference
  },
  
  // Engagement metrics
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  likesCount: {
    type: Number,
    default: 0
  },
  
  // Comments/replies
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      maxlength: 280
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  commentsCount: {
    type: Number,
    default: 0
  },
  
  // Views tracking
  views: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
audioTweetSchema.index({ userId: 1, uploadedAt: -1 });
audioTweetSchema.index({ uploadedAt: -1 });
audioTweetSchema.index({ isActive: 1, isDeleted: 1 });

// Virtual for formatted file size
audioTweetSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2) + ' MB';
});

// Method to format duration
audioTweetSchema.methods.formatDuration = function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Method to increment view count
audioTweetSchema.methods.incrementViews = async function() {
  this.views += 1;
  return await this.save();
};

// Method to toggle like
audioTweetSchema.methods.toggleLike = async function(userId) {
  const userIdStr = userId.toString();
  const likeIndex = this.likes.findIndex(id => id.toString() === userIdStr);
  
  if (likeIndex > -1) {
    // Unlike
    this.likes.splice(likeIndex, 1);
    this.likesCount = Math.max(0, this.likesCount - 1);
  } else {
    // Like
    this.likes.push(userId);
    this.likesCount += 1;
  }
  
  return await this.save();
};

// Method to add comment
audioTweetSchema.methods.addComment = async function(userId, text) {
  this.comments.push({
    userId,
    text,
    createdAt: new Date()
  });
  this.commentsCount += 1;
  return await this.save();
};

// Static method to get user's audio tweets
audioTweetSchema.statics.getUserAudioTweets = function(userId, limit = 20, skip = 0) {
  return this.find({
    userId,
    isActive: true,
    isDeleted: false
  })
  .sort({ uploadedAt: -1 })
  .limit(limit)
  .skip(skip)
  .populate('userId', 'name email profilePicture');
};

// Static method to get feed audio tweets
audioTweetSchema.statics.getFeedAudioTweets = function(limit = 20, skip = 0) {
  return this.find({
    isActive: true,
    isDeleted: false
  })
  .sort({ uploadedAt: -1 })
  .limit(limit)
  .skip(skip)
  .populate('userId', 'name email profilePicture')
  .populate('comments.userId', 'name profilePicture');
};

const AudioTweet = mongoose.model('AudioTweet', audioTweetSchema);

module.exports = AudioTweet;
