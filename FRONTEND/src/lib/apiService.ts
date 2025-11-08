// API service for Express backend
const API_BASE_URL = 'http://localhost:5000/api';

export interface Subscription {
  plan: 'free' | 'bronze' | 'silver' | 'gold';
  tweetLimit: number;
  tweetCount: number;
  subscriptionEndDate: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  verified: boolean;
  createdAt: Date;
  subscription: Subscription;
  otpRequired?: boolean;
  preferredLanguage?: string;
  coverImage?: string;
}

export interface Tweet {
  _id: string;
  content: string;
  image?: string;
  audio?: {
    url: string;
    duration: number;
  };
  author: User;
  likes: string[];
  replies: string[];
  retweets: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    console.log('🔄 Attempting login with:', { email: data.email, password: '***' + data.password.slice(-3) });
    console.log('📝 Full login data:', data);
    console.log('📍 API endpoint:', `${API_BASE_URL}/auth/login`);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      console.log('📡 Login response status:', response.status);
      console.log('📡 Login response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Try to parse JSON error, but gracefully handle non-JSON responses
        let errorMessage = `Login failed (status ${response.status})`;
        try {
          const errData = await response.json();
          console.error('❌ Login error response (JSON):', errData);
          errorMessage = errData?.message || JSON.stringify(errData) || errorMessage;
        } catch (parseErr) {
          // Not JSON or empty body
          try {
            const text = await response.text();
            console.error('❌ Login error response (text):', text);
            if (text) errorMessage = text;
          } catch (e) {
            console.error('❌ Login error: could not read body', e);
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Login successful:', { user: result.user, hasToken: !!result.token });
      if (result.token) {
        localStorage.setItem('token', result.token);
      }
      return result;
    } catch (error) {
      console.error('❌ Login network error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Make sure backend is running on http://localhost:5000');
      }
      throw error;
    }
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    console.log('🔄 Attempting signup with:', { email: data.email, username: data.username, name: data.name });

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    console.log('📡 Signup response status:', response.status);

    if (!response.ok) {
      let errorMessage = `Signup failed (status ${response.status})`;
      try {
        const errData = await response.json();
        console.error('❌ Signup error response:', errData);
        errorMessage = errData?.message || JSON.stringify(errData) || errorMessage;
      } catch (parseErr) {
        try {
          const text = await response.text();
          console.error('❌ Signup error response (text):', text);
          if (text) errorMessage = text;
        } catch (e) {
          console.error('❌ Signup error: could not read body', e);
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Signup successful:', { user: result.user });
    localStorage.setItem('token', result.token);
    return result;
  }

  async getCurrentUser(): Promise<{ user: User } | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        return null;
      }

      const result = await response.json();
      return { user: result.user };
    } catch {
      // Error handling logic can be added here if needed
    }

    localStorage.removeItem('token');
    return null;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Update failed');
    }

    const result = await response.json();
    return { user: result.user };
  }

  // Tweet methods
  // Get all tweets
  async getTweets(): Promise<Tweet[]> {
    const response = await fetch(`${API_BASE_URL}/tweets`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tweets');
    }

    const result = await response.json();
    return result.tweets || [];
  }

  // Create a new tweet
  async createTweet(content: string, image?: string, audio?: { url: string; duration: number }): Promise<Tweet> {
    const response = await fetch(`${API_BASE_URL}/tweets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content, image, audio })
    });

    if (!response.ok) {
      const error = await response.json();
      // Throw a custom error object to include the error code from the backend
      const customError = new Error(error.message || 'Failed to create tweet') as Error & { code?: string };
      customError.code = error.code; // e.g., 'TWEET_LIMIT_REACHED'
      throw customError;
    }

    const result = await response.json();
    return result.tweet;
  }

  // Like/unlike a tweet
  async likeTweet(tweetId: string): Promise<Tweet> {
    const response = await fetch(`${API_BASE_URL}/tweets/${tweetId}/like`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to like tweet');
    }

    const result = await response.json();
    return result.tweet;
  }

  // Password reset methods
  async requestPasswordReset(data: { method: 'email' | 'phone'; value: string }): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request password reset');
    }

    return await response.json();
  }

  async resetPassword(data: { method: 'email' | 'phone'; value: string; otp: string; newPassword: string }): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }

    return await response.json();
  }

  // Audio OTP methods
  async sendAudioOTP(): Promise<{ message: string; email?: string; expiresIn?: string }> {
    const response = await fetch(`${API_BASE_URL}/audio/request-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send audio OTP');
    }

    return await response.json();
  }

  async verifyAudioOTP(email: string, otp: string): Promise<{ message: string; verified: boolean; validFor?: string }> {
    const response = await fetch(`${API_BASE_URL}/audio/verify-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ otp })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify audio OTP');
    }

    return await response.json();
  }

  // Audio upload method (using FormData for multipart upload)
  async uploadAudio(audioBlob: Blob, duration: number, caption?: string): Promise<{ 
    message: string;
    audioTweet: {
      id: string;
      audioUrl: string;
      duration: number;
      durationFormatted: string;
      fileSize: string;
      caption: string;
      uploadedAt: string;
    }
  }> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    if (caption) {
      formData.append('caption', caption);
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/audio/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload audio');
    }

    return await response.json();
  }

  // Get audio tweets feed
  async getAudioTweets(limit: number = 20, skip: number = 0): Promise<{ audioTweets: Tweet[]; count: number }> {
    const response = await fetch(`${API_BASE_URL}/audio?limit=${limit}&skip=${skip}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch audio tweets');
    }

    return await response.json();
  }

  // Delete audio tweet
  async deleteAudioTweet(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/audio/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete audio tweet');
    }

    return await response.json();
  }




  // Generic HTTP methods
  async get(endpoint: string): Promise<unknown> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async post(endpoint: string, data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async put(endpoint: string, data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async delete(endpoint: string): Promise<unknown> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Subscription methods
  async createSubscriptionOrder(planType: string): Promise<{ order: Record<string, unknown> }> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/create-order`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ planType })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create subscription order');
    }

    return await response.json();
  }

  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    planType: string;
  }): Promise<{ message: string; subscription: Record<string, unknown>; invoiceNumber: string }> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/verify-payment`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment verification failed');
    }

    return await response.json();
  }

  async getSubscriptionStatus(): Promise<{ subscription: Record<string, unknown>; remainingTweets: number | string }> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/status`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscription status');
    }

    return await response.json();
  }

  async getSubscriptionPlans(): Promise<{ plans: Record<string, unknown> }> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/plans`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscription plans');
    }

    return await response.json();
  }

  async getSubscriptionHistory(): Promise<{ subscriptions: Record<string, unknown>[] }> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/history`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscription history');
    }

    return await response.json();
  }

  // Phone OTP methods
  async sendPhoneOTP(phone: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/send-phone-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ phone })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send phone OTP');
    }

    return await response.json();
  }

  async verifyPhoneOTP(phone: string, otp: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-phone-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ phone, otp })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify phone OTP');
    }

    return await response.json();
  }

  // Language OTP methods
  async sendLanguageOTP(language: string): Promise<{ message: string; verificationType?: string; demo_otp?: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/send-language-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ language })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send language OTP');
    }

    return await response.json();
  }

  async verifyLanguageOTP(language: string, otp: string): Promise<{ message: string; preferredLanguage: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-language-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ language, otp })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify language OTP');
    }

    return await response.json();
  }

  // Notification Settings API
  async getNotificationSettings(): Promise<{ notificationSettings: { enabled: boolean; keywords: string[]; browserPermissionGranted: boolean } }> {
    const response = await fetch(`${API_BASE_URL}/auth/notification-settings`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get notification settings');
    }

    return await response.json();
  }

  async updateNotificationSettings(settings: { enabled: boolean; keywords: string[]; browserPermissionGranted: boolean }): Promise<{ message: string; notificationSettings: { enabled: boolean; keywords: string[]; browserPermissionGranted: boolean } }> {
    const response = await fetch(`${API_BASE_URL}/auth/notification-settings`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ notificationSettings: settings })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update notification settings');
    }

    return await response.json();
  }
}

export const apiService = new ApiService();

// Auth API for backward compatibility
export const authAPI = {
  login: apiService.login.bind(apiService),
  signup: apiService.signup.bind(apiService),
  getCurrentUser: apiService.getCurrentUser.bind(apiService),
  logout: apiService.logout.bind(apiService),
  updateProfile: apiService.updateProfile.bind(apiService)
};
