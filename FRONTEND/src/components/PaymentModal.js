import React, { useState, useEffect } from 'react';
import { isPaymentTimeAllowed, getNextPaymentTime } from '@/utils/timeUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_key_id';

// A custom hook to load the Razorpay script
const useScript = (src) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [src]);
};

const PaymentModal = ({ planId, planName, amount, onClose, onSuccess }) => {
  useScript('https://checkout.razorpay.com/v1/checkout.js');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if payment is allowed during current time
      if (!isPaymentTimeAllowed()) {
        const nextTime = getNextPaymentTime();
        throw new Error(`Payments are only allowed between 10 AM - 11 AM IST. Next available time: ${nextTime}`);
      }

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // 1. Create Order on our backend
      const orderResponse = await fetch(`${API_URL}/subscriptions/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType: planId })
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create payment order.');
      }

      const { order } = orderData;

      // 2. Configure and open Razorpay Checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Twiller Subscription',
        description: `Payment for ${planName}`,
        order_id: order.orderId,
        handler: async function (response) {
          // 3. Verify Payment on our backend
          const verifyResponse = await fetch(`${API_URL}/subscriptions/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              planType: planId
            })
          });

          const verifyData = await verifyResponse.json();
          if (verifyResponse.ok) {
            onSuccess(verifyData);
          } else {
            setError(verifyData.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
        },
        theme: {
          color: '#1DA1F2'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setError('Payment was cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-8 rounded-lg max-w-sm w-full text-center">
        <h3 className="text-2xl font-bold mb-4">Confirm Subscription</h3>
        <p className="mb-2">You are subscribing to the <span className="font-semibold">{planName}</span>.</p>
        <p className="text-3xl font-bold mb-6">₹{amount}/month</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button onClick={handlePayment} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-600">
          {loading ? 'Processing...' : 'Proceed to Pay'}
        </button>
        <button onClick={onClose} disabled={loading} className="w-full mt-4 text-gray-400 hover:text-white">Cancel</button>
      </div>
    </div>
  );
};

export default PaymentModal;