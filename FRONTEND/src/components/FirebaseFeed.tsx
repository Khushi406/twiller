'use client';

import React, { useState, useEffect } from 'react';
import TweetComposer from './TweetComposer';
import { getTweets, createTweet, CreateTweetData, Tweet as FirebaseTweet } from '../lib/tweetService';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import Tweet from './Tweet';

const FirebaseFeed = () => {
  const [tweets, setTweets] = useState<FirebaseTweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load tweets on component mount
  useEffect(() => {
    loadTweets();
  }, []);

  const loadTweets = async () => {
    try {
      setIsLoading(true);
      const fetchedTweets = await getTweets(20);
      setTweets(fetchedTweets);
    } catch (error) {
      console.error('Error loading tweets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTweet = async (content: string, image?: string) => {
    if (!user) return;

    try {
      const tweetData: CreateTweetData = {
        content,
        image,
        authorId: user.id,
        authorName: user.name,
        authorUsername: user.username,
        authorAvatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=128&background=1da1f2&color=fff`,
        authorVerified: user.verified
      };

      const tweetId = await createTweet(tweetData);
      
      // Add the new tweet to the beginning of the list
      const newTweet: FirebaseTweet = {
        id: tweetId,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=128&background=1da1f2&color=fff`,
          verified: user.verified
        },
        content,
        image,
        timestamp: new Date(),
        likes: 0,
        retweets: 0,
        replies: 0,
        likedBy: [],
        retweetedBy: []
      };

      setTweets(prev => [newTweet, ...prev]);
      
    } catch (error) {
      console.error('Error creating tweet:', error);
      alert('Failed to create tweet. Please try again.');
    }
  };

  // Convert Firebase tweet to component tweet format
  const convertToComponentTweet = (firebaseTweet: FirebaseTweet) => {
    return {
      id: parseInt(firebaseTweet.id) || Math.random(),
      author: firebaseTweet.author,
      content: firebaseTweet.content,
      timestamp: firebaseTweet.timestamp.toLocaleString(),
      likes: firebaseTweet.likes,
      retweets: firebaseTweet.retweets,
      replies: firebaseTweet.replies,
      image: firebaseTweet.image
    };
  };

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Please log in to view your feed.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 border-l border-r border-gray-800">
      {/* Tweet Composer */}
      <div className="border-b border-gray-800">
        <TweetComposer
          onTweet={handleNewTweet}
          user={user}
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading tweets...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Tweets */}
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
              tweets.map((tweet) => (
                <Tweet
                  key={tweet.id}
                  tweet={convertToComponentTweet(tweet)}
                />
              ))
            )}
          </div>

          {/* Refresh Button */}
          <div className="p-4 text-center border-t border-gray-800">
            <button
              onClick={loadTweets}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load more tweets'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FirebaseFeed;