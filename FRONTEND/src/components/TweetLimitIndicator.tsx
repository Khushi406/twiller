"use client"

import React, { useEffect, useState } from 'react'
import { Crown, AlertTriangle } from 'lucide-react'
import { apiService } from '@/lib/apiService'

interface TweetLimitIndicatorProps {
  onUpgradeClick: () => void
}

const TweetLimitIndicator = ({ onUpgradeClick }: TweetLimitIndicatorProps) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscription: any;
    remainingTweets: number | string;
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubscriptionStatus()
  }, [])

  const loadSubscriptionStatus = async () => {
    try {
      const status = await apiService.getSubscriptionStatus()
      setSubscriptionStatus(status)
    } catch (error) {
      console.error('Failed to load subscription status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (!subscriptionStatus) return null

  const { subscription, remainingTweets } = subscriptionStatus
  const isFreePlan = subscription.plan === 'free'
  const isLowOnTweets = typeof remainingTweets === 'number' && remainingTweets <= 1

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${isFreePlan ? 'bg-gray-200' : 'bg-yellow-100'}`}>
          {isFreePlan ? (
            <AlertTriangle className="w-4 h-4 text-gray-600" />
          ) : (
            <Crown className="w-4 h-4 text-yellow-600" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900 capitalize">
            {subscription.plan} Plan
          </p>
          <p className="text-xs text-gray-600">
            {remainingTweets === 'unlimited'
              ? 'Unlimited tweets remaining'
              : `${remainingTweets} tweet${remainingTweets === 1 ? '' : 's'} remaining`
            }
          </p>
        </div>
      </div>

      {isFreePlan && (
        <button
          onClick={onUpgradeClick}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isLowOnTweets
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLowOnTweets ? 'Upgrade Now' : 'Upgrade'}
        </button>
      )}
    </div>
  )
}

export default TweetLimitIndicator
