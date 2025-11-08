"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import AudioPlayer from './AudioPlayer'
import { useNotifications } from '@/hooks/useNotifications'

interface Author {
  name: string
  username: string
  avatar: string
  verified: boolean
}

interface TweetData {
  id: number
  author: Author
  content: string
  timestamp: string
  likes: number
  retweets: number
  replies: number
  image?: string
  audio?: {
    url: string
    duration: number
  }
}

interface TweetProps {
  tweet: TweetData
}

const Tweet = ({ tweet }: TweetProps) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isRetweeted, setIsRetweeted] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(tweet.likes)
  const [retweetsCount, setRetweetsCount] = useState(tweet.retweets)
  
  const { checkAndNotify } = useNotifications()

  // Check for notification keywords when tweet loads
  useEffect(() => {
    if (tweet.content && tweet.author.username) {
      console.log('🔔 Tweet loaded, checking for notifications:', {
        content: tweet.content,
        username: tweet.author.username,
        containsCricket: tweet.content.toLowerCase().includes('cricket'),
        containsScience: tweet.content.toLowerCase().includes('science')
      });
      checkAndNotify(tweet.content, tweet.author.username)
    }
  }, [tweet.content, tweet.author.username, checkAndNotify])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const handleRetweet = () => {
    setIsRetweeted(!isRetweeted)
    setRetweetsCount(isRetweeted ? retweetsCount - 1 : retweetsCount + 1)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="border-b border-gray-800 p-4 hover:bg-gray-950/50 transition-colors cursor-pointer">
      <div className="flex space-x-3">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          <Image
            src={tweet.author.avatar}
            alt={tweet.author.name}
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>

        {/* Tweet Content */}
        <div className="flex-1 min-w-0">
          {/* Author Info */}
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-bold text-white hover:underline cursor-pointer">
              {tweet.author.name}
            </h3>
            {tweet.author.verified && (
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            )}
            <span className="text-gray-500">@{tweet.author.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 hover:underline cursor-pointer">{tweet.timestamp}</span>
            <div className="ml-auto">
              <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Tweet Text */}
          <div className="text-white mb-3 text-[15px] leading-relaxed">
            {tweet.content}
          </div>

          {/* Tweet Image */}
          {tweet.image && (
            <div className="mb-3 rounded-2xl overflow-hidden">
              <Image
                src={tweet.image}
                alt="Tweet image"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Tweet Audio */}
          {tweet.audio && (
            <div className="mb-3">
              <AudioPlayer
                audioUrl={tweet.audio.url}
                duration={tweet.audio.duration}
                title={`Audio from ${tweet.author.name}`}
              />
            </div>
          )}

          {/* Interaction Buttons */}
          <div className="flex items-center justify-between max-w-md mt-3">
            {/* Reply */}
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-sm">{tweet.replies > 0 ? formatNumber(tweet.replies) : ''}</span>
            </button>

            {/* Retweet */}
            <button 
              onClick={handleRetweet}
              className={`flex items-center space-x-2 transition-colors group ${
                isRetweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <span className="text-sm">{retweetsCount > 0 ? formatNumber(retweetsCount) : ''}</span>
            </button>

            {/* Like */}
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors group ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-sm">{likesCount > 0 ? formatNumber(likesCount) : ''}</span>
            </button>

            {/* Views */}
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm">{formatNumber(Math.floor(Math.random() * 50000) + 1000)}</span>
            </button>

            {/* Share */}
            <div className="flex items-center space-x-1">
              <button 
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked ? 'text-blue-400 hover:bg-blue-400/10' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-400/10'
                }`}
              >
                <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button className="p-2 rounded-full text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tweet