"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface LoginEntry {
  id: string;
  browser: string;
  browserVersion: string;
  os: string;
  device: string;
  deviceVendor: string;
  deviceModel: string;
  ipAddress: string;
  loginTime: string;
  loginStatus: string;
  authMethod: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  sessionDuration?: number;
  logoutTime?: string;
}

const LoginHistory: React.FC = () => {
  const [history, setHistory] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLoginHistory = useCallback(async () => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      setError('Please login first');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching login history from:', `http://localhost:5000/api/auth/login-history?page=${page}&limit=10`);
      const response = await fetch(
        `http://localhost:5000/api/auth/login-history?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      console.log('Login history response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch login history');
      }

      setHistory(data.history || []);
      setTotalPages(data.pagination?.totalPages || 1);
      
      if (!data.history || data.history.length === 0) {
        console.log('No login history found');
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error fetching login history:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLoginHistory();
  }, [fetchLoginHistory]);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-blue-500" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-green-500" />;
      case 'desktop':
        return <Monitor className="w-5 h-5 text-purple-500" />;
      default:
        return <Globe className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'otp_required':
        return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'time_restricted':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Successful';
      case 'otp_required':
        return 'OTP Required';
      case 'time_restricted':
        return 'Time Restricted';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getAuthMethodBadge = (method: string) => {
    switch (method) {
      case 'direct':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Direct Access
          </span>
        );
      case 'otp_email':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            Email OTP
          </span>
        );
      case 'otp_sms':
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
            SMS OTP
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">Login History</h1>
          </div>
          <p className="text-gray-600">
            View your recent login activity and device information
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Login History List */}
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
            >
              <div className="flex items-start justify-between">
                {/* Left Section - Device & Browser Info */}
                <div className="flex gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {getDeviceIcon(entry.device)}
                  </div>
                  
                  <div className="flex-1">
                    {/* Device and Browser */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {entry.browser}
                      </h3>
                      <span className="text-sm text-gray-500">
                        v{entry.browserVersion}
                      </span>
                    </div>

                    {/* Device Details */}
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">OS:</span> {entry.os}
                      </p>
                      <p>
                        <span className="font-medium">Device:</span>{' '}
                        {entry.deviceVendor} {entry.deviceModel} ({entry.device})
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">IP:</span> {entry.ipAddress}
                      </p>
                      {entry.location && (
                        <p>
                          <span className="font-medium">Location:</span>{' '}
                          {entry.location.city}, {entry.location.country}
                        </p>
                      )}
                    </div>

                    {/* Login Time */}
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {formatDate(entry.loginTime)}
                    </div>

                    {/* Auth Method Badge */}
                    <div className="mt-2">
                      {getAuthMethodBadge(entry.authMethod)}
                    </div>
                  </div>
                </div>

                {/* Right Section - Status */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(entry.loginStatus)}
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusText(entry.loginStatus)}
                    </span>
                  </div>

                  {entry.sessionDuration !== undefined && entry.sessionDuration > 0 && (
                    <span className="text-xs text-gray-500">
                      Session: {entry.sessionDuration} min
                    </span>
                  )}

                  {entry.logoutTime && (
                    <span className="text-xs text-gray-500">
                      Logged out: {formatDate(entry.logoutTime)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {history.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Login History
            </h3>
            <p className="text-gray-600">
              Your login activity will appear here
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginHistory;
