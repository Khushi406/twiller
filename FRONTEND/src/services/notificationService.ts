'use client';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private permissionGranted: boolean = false;

  private constructor() {
    this.checkPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Check current notification permission status
   */
  private checkPermission(): void {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permissionGranted = Notification.permission === 'granted';
    }
  }

  /**
   * Request notification permission from user
   */
  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show a notification with given options
   */
  public async showNotification(options: NotificationOptions): Promise<void> {
    console.log('🔔 NotificationService.showNotification called with:', options);
    
    if (!this.permissionGranted) {
      console.log('🔔 Permission not granted, requesting...');
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('🔔 Cannot show notification: permission not granted');
        return;
      }
    }

    try {
      console.log('🔔 Creating new Notification...');
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        badge: '/favicon.ico',
        requireInteraction: true, // Keep notification visible until user interacts
      });

      console.log('🔔 Notification created successfully:', notification);

      // Auto-close notification after 10 seconds
      setTimeout(() => {
        console.log('🔔 Auto-closing notification');
        notification.close();
      }, 10000);

      // Handle notification click
      notification.onclick = () => {
        console.log('🔔 Notification clicked');
        window.focus();
        notification.close();
      };

    } catch (error) {
      console.error('🔔 Error creating notification:', error);
    }
  }

  /**
   * Check if keyword-based notification should be triggered
   */
  public shouldNotify(text: string, keywords: string[] = ['cricket', 'science']): boolean {
    if (!text) return false;
    
    const lowercaseText = text.toLowerCase();
    return keywords.some(keyword => 
      lowercaseText.includes(keyword.toLowerCase())
    );
  }

  /**
   * Show notification for tweet with cricket/science keywords
   */
  public async notifyForTweet(tweetText: string, username: string = 'User'): Promise<void> {
    if (!this.shouldNotify(tweetText)) {
      return;
    }

    const keywords = this.getMatchingKeywords(tweetText);
    const keywordText = keywords.length > 1
      ? keywords.slice(0, -1).join(', ') + ' and ' + keywords[keywords.length - 1]
      : keywords[0];

    await this.showNotification({
      title: `New ${keywordText} tweet from @${username}`,
      body: tweetText,
      tag: 'tweet-notification',
      icon: '/favicon.ico'
    });
  }

  /**
   * Get matching keywords from text
   */
  private getMatchingKeywords(text: string): string[] {
    const keywords = ['cricket', 'science'];
    const lowercaseText = text.toLowerCase();
    
    return keywords.filter(keyword => 
      lowercaseText.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if notifications are supported and enabled
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Get current permission status
   */
  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();