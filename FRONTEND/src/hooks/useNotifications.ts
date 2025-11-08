'use client';

import { useEffect, useState, useCallback } from 'react';
import { notificationService } from '@/services/notificationService';
import { apiService } from '@/lib/apiService';

interface NotificationPreferences {
  enabled: boolean;
  keywords: string[];
  browserPermissionGranted: boolean;
}

interface UseNotificationsReturn {
  preferences: NotificationPreferences;
  loading: boolean;
  error: string | null;
  checkAndNotify: (tweetText: string, username: string) => Promise<void>;
  updatePreferences: (newPreferences: NotificationPreferences) => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    keywords: ['cricket', 'science'],
    browserPermissionGranted: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notification preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/auth/notification-settings') as { notificationSettings: NotificationPreferences };
      
      if (response.notificationSettings) {
        setPreferences(response.notificationSettings);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
      setError('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      setLoading(true);
      await apiService.put('/auth/notification-settings', {
        notificationSettings: newPreferences
      });
      
      setPreferences(newPreferences);
      setError(null);
    } catch (err) {
      console.error('Failed to update notification preferences:', err);
      setError('Failed to update notification settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        const updatedPreferences = {
          ...preferences,
          browserPermissionGranted: true
        };
        await updatePreferences(updatedPreferences);
      }
      return granted;
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return false;
    }
  };

  const checkAndNotify = useCallback(async (tweetText: string, username: string = 'User') => {
    console.log('🔔 checkAndNotify called:', { 
      tweetText, 
      username, 
      enabled: preferences.enabled,
      keywords: preferences.keywords 
    });

    // Only proceed if notifications are enabled
    if (!preferences.enabled) {
      console.log('🔔 Notifications disabled, skipping');
      return;
    }

    // Check if browser permission is granted
    const permissionStatus = notificationService.getPermissionStatus();
    console.log('🔔 Permission status:', permissionStatus);
    if (permissionStatus !== 'granted') {
      console.log('🔔 Permission not granted, skipping');
      return;
    }

    // Check if tweet contains any of the keywords
    const shouldNotify = preferences.keywords.some(keyword => 
      tweetText.toLowerCase().includes(keyword.toLowerCase())
    );

    console.log('🔔 Should notify:', shouldNotify, 'Keywords found:', 
      preferences.keywords.filter(keyword => 
        tweetText.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (shouldNotify) {
      try {
        console.log('🔔 Triggering notification...');
        await notificationService.notifyForTweet(tweetText, username);
      } catch (err) {
        console.error('🔔 Failed to show notification:', err);
      }
    }
  }, [preferences.enabled, preferences.keywords]);

  return {
    preferences,
    loading,
    error,
    checkAndNotify,
    updatePreferences,
    requestPermission
  };
};