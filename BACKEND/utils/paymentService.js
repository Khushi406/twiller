const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret'
});

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free Plan',
    tweetLimit: 1,
    price: 0,
    duration: 30 // days
  },
  bronze: {
    name: 'Bronze Plan',
    tweetLimit: 3,
    price: 100,
    duration: 30 // days
  },
  silver: {
    name: 'Silver Plan',
    tweetLimit: 5,
    price: 300,
    duration: 30 // days
  },
  gold: {
    name: 'Gold Plan',
    tweetLimit: -1, // unlimited
    price: 1000,
    duration: 30 // days
  }
};

// Check if current time is within allowed payment window (10 AM to 11 AM IST)
const isPaymentTimeAllowed = () => {
  const now = new Date();
  // IST is UTC+5:30, so we need to adjust the current time
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(now.getTime() + istOffset);

  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();

  // Convert to minutes since midnight for easier comparison
  const currentMinutes = hours * 60 + minutes;
  const startMinutes = 10 * 60; // 10:00 AM
  const endMinutes = 11 * 60; // 11:00 AM

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

// Create Razorpay order
const createOrder = async (planType, userId) => {
  try {
    if (!isPaymentTimeAllowed()) {
      throw new Error('Payments are only allowed between 10:00 AM and 11:00 AM IST');
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    if (plan.price === 0) {
      throw new Error('Free plan does not require payment');
    }

    const options = {
      amount: plan.price * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: planType
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Verify payment signature
const verifyPayment = (orderId, paymentId, signature) => {
  try {
    const sign = orderId + '|' + paymentId;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret')
      .update(sign.toString())
      .digest('hex');

    return expectedSign === signature;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

// Get plan details
const getPlanDetails = (planType) => {
  return SUBSCRIPTION_PLANS[planType] || null;
};

// Get all available plans
const getAllPlans = () => {
  return SUBSCRIPTION_PLANS;
};

module.exports = {
  createOrder,
  verifyPayment,
  getPlanDetails,
  getAllPlans,
  isPaymentTimeAllowed,
  SUBSCRIPTION_PLANS
};
