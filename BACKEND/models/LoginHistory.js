const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  browser: {
    name: String,
    version: String,
    fullName: String
  },
  os: {
    name: String,
    version: String,
    platform: String
  },
  device: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown'
    },
    vendor: String,
    model: String
  },
  userAgent: {
    type: String,
    required: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  loginStatus: {
    type: String,
    enum: ['success', 'failed', 'otp_required', 'time_restricted'],
    default: 'success'
  },
  authMethod: {
    type: String,
    enum: ['direct', 'otp_email', 'otp_sms'],
    default: 'direct'
  },
  location: {
    country: String,
    city: String,
    timezone: String
  },
  sessionDuration: {
    type: Number, // in minutes
    default: 0
  },
  logoutTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
loginHistorySchema.index({ userId: 1, loginTime: -1 });
loginHistorySchema.index({ ipAddress: 1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
