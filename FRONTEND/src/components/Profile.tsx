'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar, LinkIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/ExpressAuthContext';
import { useTranslation } from 'react-i18next';
import Tweet from './Tweet';
import EditProfile from './EditProfile';
import NotificationSettings from './NotificationSettings';
import Image from 'next/image';

const Profile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('tweets');
  const [showEditProfile, setShowEditProfile] = useState(false);

  const tabs = [
    { id: 'posts', label: t('profile.posts') },
    { id: 'replies', label: t('profile.replies') },
    { id: 'media', label: t('profile.media') },
    { id: 'likes', label: t('profile.likes') },
    { id: 'settings', label: t('profile.settings') },
  ];

  if (!user) return null;

  const profileTweets = [
    {
      id: 1,
      author: {
        name: user.name,
        username: user.username,
        avatar: user.avatar || '/default-avatar.png',
        verified: user.verified,
      },
      content: 'Excited to be building with the latest tools! This journey is amazing.',
      timestamp: '5h',
      likes: 150,
      retweets: 30,
      replies: 15,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm p-4 border-b border-gray-800 z-10">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-sm text-gray-400">1 Tweet</p>
          </div>
        </div>
      </div>

      {/* Cover Image and Profile Picture */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          {user?.coverImage && (
            <Image
              src={user.coverImage}
              alt="Cover"
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-4">
          <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden">
            <Image
              src={user.avatar || '/default-avatar.png'}
              alt={user.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="absolute top-4 right-4">
          <Button
            onClick={() => setShowEditProfile(true)}
            className="bg-white text-black hover:bg-gray-200 font-bold px-4 py-2 rounded-full"
          >
            {t('profile.editProfile')}
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 pt-20 pb-4">
        {/* User Details */}
        <div className="mt-4">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-400">@{user.username}</p>
          <p className="mt-2 text-white">{user.bio || 'No bio available'}</p>
          <div className="flex flex-wrap text-gray-400 mt-2 space-x-4 text-sm">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>San Francisco, CA</span>
            </div>
            <div className="flex items-center">
              <LinkIcon className="w-4 h-4 mr-1" />
              <a href="#" className="text-blue-400 hover:underline">
                website.com
              </a>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex space-x-4 mt-2 text-sm">
            <p>
              <span className="font-bold text-white">123</span> <span className="text-gray-400">{t('profile.following')}</span>
            </p>
            <p>
              <span className="font-bold text-white">456</span> <span className="text-gray-400">{t('profile.followers')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center relative hover:bg-gray-900 transition-colors ${
                activeTab === tab.id ? 'text-white' : 'text-gray-400'
              }`}
            >
              <span className="font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {activeTab === 'tweets' && (
          <div>
            {profileTweets.map((tweet) => (
              <Tweet key={tweet.id} tweet={tweet} />
            ))}
          </div>
        )}
        {activeTab === 'replies' && (
          <div className="p-8 text-center text-gray-400">
            <p>{t('profile.noReplies')}</p>
          </div>
        )}
        {activeTab === 'media' && (
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  <Image
                    src={`https://images.unsplash.com/photo-${1600000000000 + i}?w=300&h=300&fit=crop`}
                    alt={`Media ${i}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'likes' && (
          <div className="p-8 text-center text-gray-400">
            <p>{t('profile.noLikes')}</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="p-6">
            <NotificationSettings />
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile onClose={() => setShowEditProfile(false)} />
      )}
    </div>
  );
};

export default Profile;