const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // OTP for Chrome login
  loginOTP: {
    type: String
  },
  loginOTPExpires: {
    type: Date
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&size=128&background=1da1f2&color=fff`;
    }
  },
  bio: {
    type: String,
    maxlength: [160, 'Bio cannot exceed 160 characters'],
    default: ''
  },
  phone: {
    type: String,
    sparse: true, // Allows multiple null values
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  verified: {
    type: Boolean,
    default: false
  },
  // Password reset fields
  passwordResetOTP: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  lastPasswordResetRequest: {
    type: Date
  },
  // Audio upload verification fields
  audioUploadOTP: {
    type: String
  },
  audioUploadOTPExpires: {
    type: Date
  },
  audioUploadVerified: {
    type: Date
  },
  // Language switch verification fields
  languageSwitchOTP: {
    type: String
  },
  languageSwitchOTPExpires: {
    type: Date
  },
  languageSwitchVerified: {
    type: Date
  },
  preferredLanguage: {
    type: String,
    default: 'en',
    enum: ['en', 'fr', 'es', 'hi', 'pt', 'zh']
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Subscription details
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'bronze', 'silver', 'gold'],
      default: 'free'
    },
    tweetLimit: {
      type: Number,
      default: 1 // Default for free plan
    },
    tweetCount: {
      type: Number,
      default: 0
    },
    subscriptionEndDate: {
      type: Date,
      default: null
    }
  },
  // Notification settings
  notificationSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    keywords: {
      type: [String],
      default: ['cricket', 'science']
    },
    browserPermissionGranted: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  ,
  // Login tracking
  loginHistory: [
    {
      date: { type: Date, default: Date.now },
      ip: String,
      browser: String,
      os: String,
      deviceType: String,
      otpRequired: Boolean,
      success: Boolean
    }
  ]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);