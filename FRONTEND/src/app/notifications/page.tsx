'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/ExpressAuthContext';
import Sidebar from '@/components/Sidebar';
import RightPanel from '@/components/RightPanel';
import { apiService } from '@/lib/apiService';

interface Notification {
  id: string;
  type: 'like' | 'retweet' | 'reply' | 'follow' | 'mention';
  fromUser: {
    name: string;
    username: string;
    avatar?: string;
  };
  tweet?: {
    id: string;
    content: string;
  };
  timestamp: string;
  read: boolean;
}

const NotificationsPage = () => {
  const { user, isLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      // For now, we'll create mock notifications
      // In a real app, you'd fetch from your backend
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'like',
          fromUser: {
            name: 'John Doe',
            username: 'johndoe',
            avatar: '/default-avatar.png'
          },
          tweet: {
            id: 'tweet1',
            content: 'Great post about #Science!'
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          read: false
        },
        {
          id: '2',
          type: 'retweet',
          fromUser: {
            name: 'Jane Smith',
            username: 'janesmith',
            avatar: '/default-avatar.png'
          },
          tweet: {
            id: 'tweet2',
            content: 'Check out this #Cricket match!'
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          read: true
        },
        {
          id: '3',
          type: 'follow',
          fromUser: {
            name: 'Tech News',
            username: 'technews',
            avatar: '/default-avatar.png'
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          read: false
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your tweet';
      case 'retweet':
        return 'retweeted your tweet';
      case 'reply':
        return 'replied to your tweet';
      case 'follow':
        return 'followed you';
      case 'mention':
        return 'mentioned you';
      default:
        return 'interacted with your tweet';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'retweet':
        return '🔄';
      case 'reply':
        return '💬';
      case 'follow':
        return '👤';
      case 'mention':
        return '@';
      default:
        return '🔔';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view notifications</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <div className="w-64 xl:w-80 flex-shrink-0">
          <Sidebar
            user={user}
            onLogout={() => {}}
            currentView="notifications"
            onViewChange={() => {}}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen border-x border-gray-800">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-sm p-4 border-b border-gray-800 z-10">
              <h1 className="text-xl font-bold text-white">Notifications</h1>
            </div>

            {/* Notifications Feed */}
            <div className="divide-y divide-gray-800">
              {isLoadingNotifications ? (
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400">Loading notifications...</span>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">No notifications yet</h2>
                  <p className="text-gray-400">
                    When someone likes, retweets, or replies to your tweets, you'll see it here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-900/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-white">
                            {notification.fromUser.name}
                          </span>
                          <span className="text-gray-400">
                            @{notification.fromUser.username}
                          </span>
                          <span className="text-gray-500 text-sm">·</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(notification.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-2">
                          {getNotificationText(notification)}
                        </p>
                        {notification.tweet && (
                          <div className="bg-gray-800/50 rounded-lg p-3 mt-2">
                            <p className="text-white text-sm">{notification.tweet.content}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
