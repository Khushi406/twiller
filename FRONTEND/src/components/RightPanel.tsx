"use client"

import React from 'react'
import { useRouter } from 'next/navigation'

const RightPanel = () => {
  const router = useRouter()
  const trendingTopics = [
    { topic: '#NextJS', posts: '125K posts' },
    { topic: '#TypeScript', posts: '89K posts' },
    { topic: '#WebDevelopment', posts: '234K posts' },
    { topic: '#React', posts: '567K posts' },
    { topic: '#JavaScript', posts: '1.2M posts' }
  ]

  const suggestedUsers = [
    {
      id: 1,
      name: 'John Developer',
      username: 'johndev',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      verified: true
    },
    {
      id: 2,
      name: 'Sarah Design',
      username: 'sarahui',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      verified: false
    },
    {
      id: 3,
      name: 'Tech News',
      username: 'technews',
      avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=face',
      verified: true
    }
  ]

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-black p-4 overflow-y-auto">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <svg 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search Twitter"
            className="w-full bg-gray-900 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Premium Subscription Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
          <svg className="w-8 h-8 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        
        <p className="text-white/90 text-sm mb-4">
          Unlock exclusive features and take your experience to the next level!
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span className="text-white text-sm">More tweets per day</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span className="text-white text-sm">Audio tweet uploads</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span className="text-white text-sm">Priority support</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span className="text-white text-sm">Custom profile themes</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/subscribe')}
          className="w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          Subscribe Now
        </button>
        
        <p className="text-white/70 text-xs text-center mt-3">
          Starting at $4.99/month
        </p>
      </div>

      {/* What's Happening */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">What&apos;s happening</h2>
        <div className="space-y-3">
          {trendingTopics.map((trend, index) => (
            <div key={index} className="hover:bg-gray-800 p-2 rounded-lg cursor-pointer transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">Trending in Technology</p>
                  <p className="font-bold">{trend.topic}</p>
                  <p className="text-gray-400 text-sm">{trend.posts}</p>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="text-blue-400 hover:underline mt-3">Show more</button>
      </div>

      {/* Who to Follow */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Who to follow</h2>
        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full bg-cover bg-center" 
                     style={{ backgroundImage: `url(${user.avatar})` }}
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    {user.verified && (
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">@{user.username}</p>
                </div>
              </div>
              <button className="bg-white text-black px-4 py-1 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                Follow
              </button>
            </div>
          ))}
        </div>
        <button className="text-blue-400 hover:underline mt-3">Show more</button>
      </div>

      {/* Footer Links */}
      <div className="text-gray-500 text-sm space-y-1">
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Cookie Policy</a>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">Accessibility</a>
          <a href="#" className="hover:underline">Ads info</a>
          <a href="#" className="hover:underline">More</a>
        </div>
        <p className="mt-2">© 2024 Twiller Corp.</p>
      </div>
    </div>
  )
}

export default RightPanel