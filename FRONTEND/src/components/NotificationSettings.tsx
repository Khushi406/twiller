'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notificationService } from '../services/notificationService';
import { apiService } from '../lib/apiService';

interface NotificationSettingsProps {
  className?: string;
}

interface NotificationPreferences {
  enabled: boolean;
  keywords: string[];
  browserPermissionGranted: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className = '' }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    keywords: ['cricket', 'science'],
    browserPermissionGranted: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    loadNotificationPreferences();
    checkBrowserPermission();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const response = await apiService.get('/auth/notification-settings') as { notificationSettings: NotificationPreferences };
      if (response.notificationSettings) {
        setPreferences(response.notificationSettings);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const checkBrowserPermission = () => {
    const status = notificationService.getPermissionStatus();
    setPermissionStatus(status);
  };

  const handleToggleNotifications = async () => {
    setLoading(true);
    try {
      const newEnabled = !preferences.enabled;
      
      if (newEnabled && permissionStatus !== 'granted') {
        // Request browser permission first
        const granted = await notificationService.requestPermission();
        if (!granted) {
          setMessage('Browser permission is required to enable notifications.');
          setLoading(false);
          return;
        }
        setPermissionStatus('granted');
      }

      // Update preferences
      const updatedPreferences = {
        ...preferences,
        enabled: newEnabled,
        browserPermissionGranted: permissionStatus === 'granted'
      };

      await apiService.put('/auth/notification-settings', {
        notificationSettings: updatedPreferences
      });

      setPreferences(updatedPreferences);
      setMessage(newEnabled ? 'Notifications enabled!' : 'Notifications disabled!');
      
      // Test notification if enabling
      if (newEnabled) {
        setTimeout(() => {
          notificationService.showNotification({
            title: 'Twiller Notifications Enabled!',
            body: 'You will now receive notifications for cricket and science tweets.',
            tag: 'settings-test'
          });
        }, 500);
      }

    } catch (error) {
      console.error('Failed to update notification settings:', error);
      setMessage('Failed to update notification settings. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const testNotification = async () => {
    if (!preferences.enabled) {
      setMessage('Please enable notifications first.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await notificationService.showNotification({
        title: 'Test Notification',
        body: 'This is a test cricket notification to check if everything is working properly!',
        tag: 'test-notification'
      });

      setMessage('Test notification sent!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to send test notification:', error);
      setMessage('Failed to send test notification.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted': return 'text-green-500';
      case 'denied': return 'text-red-500';
      case 'unsupported': return 'text-gray-500';
      default: return 'text-yellow-500';
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted': return 'Granted';
      case 'denied': return 'Denied';
      case 'unsupported': return 'Not Supported';
      default: return 'Not Requested';
    }
  };

  if (!notificationService.isSupported()) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <BellOff className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
        </div>
        <p className="text-gray-400">
          Your browser doesn&apos;t support notifications.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Settings className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
      </div>

      {/* Notification Toggle */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          {preferences.enabled ? (
            <Bell className="w-5 h-5 text-green-400" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <p className="text-white font-medium">Tweet Notifications</p>
            <p className="text-sm text-gray-400">
              Get notified for tweets about cricket and science
            </p>
          </div>
        </div>
        <Button
          onClick={handleToggleNotifications}
          disabled={loading}
          variant={preferences.enabled ? "destructive" : "default"}
          size="sm"
        >
          {loading ? '...' : preferences.enabled ? 'Disable' : 'Enable'}
        </Button>
      </div>

      {/* Permission Status */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
        <div>
          <p className="text-white font-medium">Browser Permission</p>
          <p className="text-sm text-gray-400">
            Required to show desktop notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          {permissionStatus === 'granted' ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <X className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-sm ${getPermissionStatusColor()}`}>
            {getPermissionStatusText()}
          </span>
        </div>
      </div>

      {/* Keywords */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <p className="text-white font-medium mb-2">Notification Keywords</p>
        <div className="flex gap-2">
          {preferences.keywords.map((keyword) => (
            <span
              key={keyword}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Test Button */}
      <div className="flex gap-3">
        <Button
          onClick={testNotification}
          variant="outline"
          size="sm"
          disabled={!preferences.enabled}
          className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
        >
          Test Notification
        </Button>
      </div>

      {/* Status Message */}
      {message && (
        <div className="mt-4 p-3 bg-blue-900/50 border border-blue-500 rounded-lg">
          <p className="text-blue-200 text-sm">{message}</p>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;