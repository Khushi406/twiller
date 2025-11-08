'use client';

import React, { useState, useEffect } from 'react';
import TweetComposer from './TweetComposer';
import { apiService, Tweet as ExpressTweet } from '../lib/apiService';
import { useAuth } from '@/contexts/ExpressAuthContext';
import Tweet from './Tweet';
import { notificationService } from '../services/notificationService';

const ExpressFeed = () => {
  const [tweets, setTweets] = useState<ExpressTweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { user } = useAuth();

  // Load tweets on component mount
  useEffect(() => {
    const initialize = async () => {
      await loadNotificationSettings();
      await loadTweets();
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const response = await apiService.getNotificationSettings();
      setNotificationsEnabled(response.notificationSettings.enabled);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const loadTweets = async () => {
    try {
      setIsLoading(true);
      const fetchedTweets = await apiService.getTweets();
      setTweets(fetchedTweets);
      
      // Check for keyword notifications in newly loaded tweets
      if (notificationsEnabled) {
        checkForKeywordNotifications(fetchedTweets);
      }
    } catch (error) {
      console.error('Error loading tweets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForKeywordNotifications = async (newTweets: ExpressTweet[]) => {
    for (const tweet of newTweets) {
      // Don't notify for user's own tweets
      if (user && tweet.author.id === user.id) {
        continue;
      }

      // Check if tweet contains cricket or science keywords
      if (notificationService.shouldNotify(tweet.content)) {
        await notificationService.notifyForTweet(tweet.content, tweet.author.username);
      }
    }
  };

  const handleTweetCreated = async (content: string, image?: string, audio?: { url: string; duration: number }) => {
    try {
      const newTweet = await apiService.createTweet(content, image, audio);
      setTweets(prevTweets => [newTweet, ...prevTweets]);
    } catch (error) {
      console.error('Error creating tweet:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 border-l border-r border-gray-800">
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400">Loading tweets...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 border-l border-r border-gray-800">
      {/* Tweet Composer */}
      <div className="border-b border-gray-800">
        <TweetComposer onTweet={handleTweetCreated} user={user} />
      </div>

      {/* Feed */}
      <div className="divide-y divide-gray-800">
        {tweets.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Twiller!</h2>
            <p className="text-gray-400 mb-4">
              This is your timeline. It&apos;ll be more interesting when you start following people.
            </p>
            <p className="text-gray-500">Share your first tweet to get started!</p>
          </div>
        ) : (
          tweets.map((tweet, index) => (
            <Tweet 
              key={tweet._id} 
              tweet={{
                id: index, // Use index as number ID
                author: {
                  name: tweet.author.name,
                  username: tweet.author.username,
                  avatar: tweet.author.avatar || '/default-avatar.png',
                  verified: tweet.author.verified,
                },
                timestamp: new Date(tweet.createdAt).toISOString(),
                content: tweet.content,
                image: tweet.image,
                audio: tweet.audio,
                likes: tweet.likes.length,
                replies: tweet.replies.length,
                retweets: tweet.retweets.length,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExpressFeed;