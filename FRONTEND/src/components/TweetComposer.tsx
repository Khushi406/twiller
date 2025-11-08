"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Mic } from 'lucide-react'
import AudioRecorder from './AudioRecorder'
import AudioOTPVerification from './AudioOTPVerification'
import AudioPlayer from './AudioPlayer'
import { apiService } from '@/lib/apiService'
import TweetLimitIndicator from './TweetLimitIndicator'

interface User {
  id: string
  email: string
  name: string
  username: string
  avatar?: string
  bio?: string
  verified: boolean
  createdAt: Date
}

interface TweetComposerProps {
  onTweet: (content: string, image?: string, audio?: { url: string; duration: number }) => void
  user: User | null
}

const TweetComposer = ({ onTweet, user }: TweetComposerProps) => {
  const [content, setContent] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [audioAttachment, setAudioAttachment] = useState<{ url: string; duration: number } | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  if (!user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() || audioAttachment) {
      onTweet(content.trim(), undefined, audioAttachment || undefined)
      setContent('')
      setAudioAttachment(null)
      setIsExpanded(false)
    }
  }

  const characterCount = content.length
  const maxCharacters = 280
  const isOverLimit = characterCount > maxCharacters

  const handleAudioClick = () => {
    setShowOTPVerification(true)
  }

  const handleOTPVerified = () => {
    setShowOTPVerification(false)
    setShowAudioRecorder(true)
  }

  const handleAudioReady = async (audioBlob: Blob, duration: number) => {
    setIsUploading(true)
    try {
      const result = await apiService.uploadAudio(audioBlob, duration, content.trim())
      setAudioAttachment({ 
        url: result.audioTweet.audioUrl, 
        duration: result.audioTweet.duration 
      })
      setShowAudioRecorder(false)
      alert(`Audio uploaded successfully! ${result.audioTweet.durationFormatted} - ${result.audioTweet.fileSize}`)
    } catch (error) {
      console.error('Failed to upload audio:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload audio. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeAudio = () => {
    setAudioAttachment(null)
  }

  const handleUpgradeClick = () => {
    // Navigate to subscription page
    window.location.href = '/subscribe'
  }

  return (
    <div className="p-4">
      {/* Tweet Limit Indicator */}
      <TweetLimitIndicator onUpgradeClick={handleUpgradeClick} />
      
      <div className="flex space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <Image
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1DA1F2&color=ffffff`}
            alt={user.name}
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>

        {/* Tweet Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            {/* Text Input */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder="What's happening?"
                className="w-full bg-transparent text-xl placeholder-gray-500 resize-none border-none outline-none"
                rows={isExpanded ? 3 : 1}
                style={{ minHeight: isExpanded ? '120px' : '56px' }}
              />
            </div>

            {/* Expanded Options */}
            {isExpanded && (
              <div className="mt-4 space-y-4">
                {/* Privacy Setting */}
                <div className="flex items-center text-blue-400 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9Z"/>
                  </svg>
                  Everyone can reply
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Media Button */}
                    <button
                      type="button"
                      className="p-2 hover:bg-blue-900/20 rounded-full transition-colors group"
                    >
                      <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7v2.99s-1.99.01-2 0V7H5v10h3v2H5a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2zM8 10V7l3 2.5L8 12zm5 1c0-.6.4-1 1-1h5c.6 0 1 .4 1 1v5c0 .6-.4 1-1 1h-5c-.6 0-1-.4-1-1v-5z"/>
                      </svg>
                    </button>

                    {/* Audio Button */}
                    <button
                      type="button"
                      onClick={handleAudioClick}
                      className="p-2 hover:bg-purple-900/20 rounded-full transition-colors group"
                      title="Record Audio Tweet"
                    >
                      <Mic className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                    </button>

                    {/* GIF Button */}
                    <button
                      type="button"
                      className="p-2 hover:bg-blue-900/20 rounded-full transition-colors group"
                    >
                      <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 10.5V8.8h-4.4v6.4h1.7v-2h2v-1.7h-2v-1H19zm-7.3-1.7h1.7v6.4h-1.7V8.8zm-3.6 1.6c.4 0 .9.2 1.2.5l1.2-1C9.9 9.2 9 8.8 8.1 8.8c-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2c.9 0 1.8-.4 2.4-1.1l-1.2-1c-.3.3-.8.5-1.2.5-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8z"/>
                      </svg>
                    </button>

                    {/* Poll Button */}
                    <button
                      type="button"
                      className="p-2 hover:bg-blue-900/20 rounded-full transition-colors group"
                    >
                      <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>

                    {/* Emoji Button */}
                    <button
                      type="button"
                      className="p-2 hover:bg-blue-900/20 rounded-full transition-colors group"
                    >
                      <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>

                    {/* Schedule Button */}
                    <button
                      type="button"
                      className="p-2 hover:bg-blue-900/20 rounded-full transition-colors group"
                    >
                      <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Character Count and Tweet Button */}
                  <div className="flex items-center space-x-3">
                    {characterCount > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="relative w-8 h-8">
                          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#2F3336"
                              strokeWidth="2"
                            />
                            <path
                              d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={isOverLimit ? "#F4212E" : "#1DA1F2"}
                              strokeWidth="2"
                              strokeDasharray={`${(characterCount / maxCharacters) * 100}, 100`}
                            />
                          </svg>
                          {characterCount > 260 && (
                            <span className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${
                              isOverLimit ? 'text-red-500' : 'text-gray-400'
                            }`}>
                              {maxCharacters - characterCount}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="h-8 w-px bg-gray-700" />

                    <button
                      type="submit"
                      disabled={(!content.trim() && !audioAttachment) || isOverLimit || isUploading}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-full transition-colors"
                    >
                      {isUploading ? 'Uploading...' : 'Tweet'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Attachment Preview */}
            {audioAttachment && (
              <div className="mt-3">
                <AudioPlayer 
                  audioUrl={audioAttachment.url}
                  duration={audioAttachment.duration}
                  title="Audio Tweet"
                />
                <button
                  type="button"
                  onClick={removeAudio}
                  className="text-red-400 hover:text-red-300 text-sm mt-2"
                >
                  Remove audio
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Audio OTP Verification Modal */}
      {showOTPVerification && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <AudioOTPVerification
            userEmail={user.email}
            onVerified={handleOTPVerified}
            onCancel={() => setShowOTPVerification(false)}
          />
        </div>
      )}

      {/* Audio Recorder Modal */}
      {showAudioRecorder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md">
            <AudioRecorder
              onAudioReady={handleAudioReady}
              onCancel={() => setShowAudioRecorder(false)}
              maxDuration={300}
              maxSize={100}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TweetComposer