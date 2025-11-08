t  'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/apiService';

const SubscriptionStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await apiService.getSubscriptionStatus();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
        // Handle error, maybe show a default state
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return <div className="p-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-400">Loading subscription status...</div>;
  }

  if (!status) {
    return null; // Don't render if status couldn't be fetched
  }

  const { subscription, remainingTweets } = status;
  const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);

  return (
    <div className="p-4 border border-gray-700 rounded-lg bg-gray-800 text-white">
      <h3 className="font-bold text-lg mb-2">Subscription Status</h3>
      <div className="space-y-2">
        <p>
          Current Plan: <span className="font-semibold text-blue-400">{planName}</span>
        </p>
        <p>
          Tweets Remaining: <span className="font-semibold">{remainingTweets}</span>
        </p>
        {subscription.plan !== 'gold' && (
          <button
            onClick={() => router.push('/subscribe')}
            className="text-sm text-blue-400 hover:underline"
          >
            Upgrade Plan
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;