const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Tweet content is required'],
    maxlength: [280, 'Tweet cannot exceed 280 characters'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: null
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  retweets: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  }],
  parentTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    default: null
  },
  isRetweet: {
    type: Boolean,
    default: false
  },
  originalTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    default: null
  }
}, {
  timestamps: true
});

// Virtual for like count
tweetSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for retweet count
tweetSchema.virtual('retweetCount').get(function() {
  return this.retweets.length;
});

// Virtual for reply count
tweetSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Ensure virtual fields are serialized
tweetSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Tweet', tweetSchema);