const express = require('express');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');
const { createOrder, verifyPayment, getPlanDetails, getAllPlans } = require('../utils/paymentService');
const { sendInvoiceEmail } = require('../utils/emailService');

const router = express.Router();

// Get all available subscription plans
router.get('/plans', (req, res) => {
  try {
    const plans = getAllPlans();
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Failed to get plans', error: error.message });
  }
});

// Get user's current subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reset tweet count if subscription has expired
    if (user.subscription.subscriptionEndDate && user.subscription.subscriptionEndDate < new Date()) {
      user.subscription.plan = 'free';
      user.subscription.tweetLimit = 1;
      user.subscription.tweetCount = 0;
      user.subscription.subscriptionEndDate = null;
      await user.save();
    }

    res.json({
      subscription: user.subscription,
      remainingTweets: user.subscription.tweetLimit === -1 ? 'unlimited' :
        Math.max(0, user.subscription.tweetLimit - user.subscription.tweetCount)
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ message: 'Failed to get subscription status', error: error.message });
  }
});

// Create payment order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { planType } = req.body;

    if (!planType) {
      return res.status(400).json({ message: 'Plan type is required' });
    }

    const plan = getPlanDetails(planType);
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    const order = await createOrder(planType, req.userId);
    res.json({ order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment order' });
  }
});

// Verify payment and update subscription
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planType } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !planType) {
      return res.status(400).json({ message: 'All payment details are required' });
    }

    // Verify payment signature
    const isValidPayment = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValidPayment) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const plan = getPlanDetails(planType);
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    // Update user subscription
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + plan.duration);

    user.subscription.plan = planType;
    user.subscription.tweetLimit = plan.tweetLimit;
    user.subscription.tweetCount = 0; // Reset tweet count
    user.subscription.subscriptionEndDate = subscriptionEndDate;
    user.subscription.isActive = true;
    await user.save();

    // Create subscription record
    const subscription = new Subscription({
      user: req.userId,
      plan: planType,
      amount: plan.price,
      razorpayOrderId,
      razorpayPaymentId,
      status: 'completed',
      subscriptionEndDate
    });
    await subscription.save();

    // Send invoice email
    try {
      await sendInvoiceEmail(user.email, {
        invoiceNumber: subscription.invoiceNumber,
        planName: plan.name,
        amount: plan.price,
        subscriptionStartDate: subscription.subscriptionStartDate,
        subscriptionEndDate: subscription.subscriptionEndDate
      });
      subscription.emailSent = true;
      await subscription.save();
    } catch (emailError) {
      console.error('Failed to send invoice email:', emailError);
      // Don't fail the payment if email fails
    }

    res.json({
      message: 'Payment successful and subscription updated',
      subscription: user.subscription,
      invoiceNumber: subscription.invoiceNumber
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
});

// Get user's subscription history
router.get('/history', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .select('plan amount status paymentDate subscriptionEndDate invoiceNumber');

    res.json({ subscriptions });
  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({ message: 'Failed to get subscription history', error: error.message });
  }
});

module.exports = router;
