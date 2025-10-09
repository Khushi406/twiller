const express = require('express');
const Tweet = require('../models/Tweet');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tweets (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const tweets = await Tweet.find({ parentTweet: null })
      .populate('author', 'name username avatar verified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Tweet.countDocuments({ parentTweet: null });

    res.json({
      tweets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get tweets error:', error);
    res.status(500).json({ 
      message: 'Failed to get tweets',
      error: error.message 
    });
  }
});

// Create new tweet
router.post('/', auth, async (req, res) => {
  try {
    const { content, image } = req.body;

    const tweet = new Tweet({
      content,
      image,
      author: req.userId
    });

    await tweet.save();
    
    // Populate author info
    await tweet.populate('author', 'name username avatar verified');

    res.status(201).json({
      message: 'Tweet created successfully',
      tweet
    });

  } catch (error) {
    console.error('Create tweet error:', error);
    res.status(500).json({ 
      message: 'Failed to create tweet',
      error: error.message 
    });
  }
});

// Like/Unlike tweet
router.post('/:id/like', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const likeIndex = tweet.likes.findIndex(
      like => like.user.toString() === req.userId
    );

    if (likeIndex > -1) {
      // Unlike
      tweet.likes.splice(likeIndex, 1);
    } else {
      // Like
      tweet.likes.push({ user: req.userId });
    }

    await tweet.save();
    await tweet.populate('author', 'name username avatar verified');

    res.json({
      message: likeIndex > -1 ? 'Tweet unliked' : 'Tweet liked',
      tweet
    });

  } catch (error) {
    console.error('Like tweet error:', error);
    res.status(500).json({ 
      message: 'Failed to like tweet',
      error: error.message 
    });
  }
});

// Retweet
router.post('/:id/retweet', auth, async (req, res) => {
  try {
    const originalTweet = await Tweet.findById(req.params.id);
    
    if (!originalTweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const retweetIndex = originalTweet.retweets.findIndex(
      retweet => retweet.user.toString() === req.userId
    );

    if (retweetIndex > -1) {
      // Unretweet
      originalTweet.retweets.splice(retweetIndex, 1);
    } else {
      // Retweet
      originalTweet.retweets.push({ user: req.userId });
    }

    await originalTweet.save();
    await originalTweet.populate('author', 'name username avatar verified');

    res.json({
      message: retweetIndex > -1 ? 'Tweet unretweeted' : 'Tweet retweeted',
      tweet: originalTweet
    });

  } catch (error) {
    console.error('Retweet error:', error);
    res.status(500).json({ 
      message: 'Failed to retweet',
      error: error.message 
    });
  }
});

// Get user tweets
router.get('/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tweets = await Tweet.find({ author: user._id, parentTweet: null })
      .populate('author', 'name username avatar verified')
      .sort({ createdAt: -1 });

    res.json({ tweets });

  } catch (error) {
    console.error('Get user tweets error:', error);
    res.status(500).json({ 
      message: 'Failed to get user tweets',
      error: error.message 
    });
  }
});

module.exports = router;