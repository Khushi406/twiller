"use client"

import React, { useState } from 'react'
import { useAuth } from '@/contexts/ExpressAuthContext'
import TweetComposer from './TweetComposer'
import Tweet from './Tweet'

const Feed = () => {
  const { user } = useAuth()
  const [tweets, setTweets] = useState([
    {
      id: 1,
      author: {
        name: 'John Developer',
        username: 'johndev',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      content: 'Just shipped a new feature with Next.js 15! The performance improvements are incredible. 🚀 #NextJS #WebDev',
      timestamp: '2h',
      likes: 234,
      retweets: 89,
      replies: 45,
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=300&fit=crop'
    },
    {
      id: 5,
      author: {
        name: 'Cricket Fan',
        username: 'cricketfan',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        verified: false
      },
      content: 'The cricket match today was absolutely thrilling! The batsman played some incredible shots. Cricket is such an amazing sport that teaches patience and strategy.',
      timestamp: '1h',
      likes: 156,
      retweets: 23,
      replies: 12
    },
    {
      id: 2,
      author: {
        name: 'Sarah Design',
        username: 'sarahui',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
        verified: false
      },
      content: 'Working on some UI animations today. Sometimes the smallest details make the biggest impact on user experience. ✨',
      timestamp: '4h',
      likes: 156,
      retweets: 23,
      replies: 12
    },
    {
      id: 3,
      author: {
        name: 'Tech News',
        username: 'technews',
        avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      content: 'BREAKING: Major breakthrough in AI development announced today. The implications for software development are huge! 🤖',
      timestamp: '6h',
      likes: 1234,
      retweets: 567,
      replies: 234
    },
    {
      id: 6,
      author: {
        name: 'Science Today',
        username: 'sciencetoday',
        avatar: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      content: 'Scientists have made a groundbreaking discovery in quantum physics! This could revolutionize our understanding of the universe. Science never ceases to amaze me.',
      timestamp: '3h',
      likes: 892,
      retweets: 234,
      replies: 89
    },
    {
      id: 4,
      author: {
        name: 'React Team',
        username: 'reactjs',
        avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      content: 'React 19 is coming with some amazing new features! Server Components are going to change everything. What are you most excited about?',
      timestamp: '8h',
      likes: 2567,
      retweets: 1234,
      replies: 567
    }
  ])

  const handleNewTweet = (content: string, image?: string) => {
    if (!user) return

    const newTweet = {
      id: Date.now(),
      author: {
        name: user.name,
        username: user.username,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1DA1F2&color=ffffff`,
        verified: user.verified
      },
      content,
      timestamp: 'now',
      likes: 0,
      retweets: 0,
      replies: 0,
      image
    }

    setTweets([newTweet, ...tweets])
  }

  return (
    <div className="flex-1 border-l border-r border-gray-800">
      {/* Tweet Composer */}
      <div className="border-b border-gray-800">
        <TweetComposer onTweet={handleNewTweet} user={user} />
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
          tweets.map((tweet) => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))
        )}
      </div>

      {/* Load More */}
      <div className="p-8 text-center">
        <button className="text-blue-400 hover:underline">
          Load more tweets
        </button>
      </div>
    </div>
  )
}

export default Feed