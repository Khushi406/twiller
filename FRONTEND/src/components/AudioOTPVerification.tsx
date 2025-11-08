'use client';

import React, { useState } from 'react';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/apiService';

interface AudioOTPVerificationProps {
  userEmail: string;
  onVerified: () => void;
  onCancel: () => void;
}

const AudioOTPVerification = ({ userEmail, onVerified, onCancel }: AudioOTPVerificationProps) => {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const sendOTP = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await apiService.sendAudioOTP();

      setMessage(result.message || 'OTP sent to your email address. Please check your inbox.');
      setStep('verify');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await apiService.verifyAudioOTP(userEmail, otp.trim());

      setMessage('Email verified successfully! You can now record audio.');
      setTimeout(() => {
        onVerified();
      }, 1500);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'request') {
        sendOTP();
      } else {
        verifyOTP();
      }
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Email Verification Required
        </h2>
        <p className="text-gray-400 text-sm">
          {step === 'request' 
            ? 'Verify your email to upload audio tweets'
            : 'Enter the verification code sent to your email'
          }
        </p>
      </div>

      {message && (
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3 mb-4">
          <p className="text-green-400 text-sm text-center">{message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {step === 'request' ? (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Email Address</p>
                <p className="text-gray-400 text-sm">{userEmail}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={sendOTP}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50"
              onKeyDown={handleKeyPress}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending OTP...</span>
                </div>
              ) : (
                'Send Verification Code'
              )}
            </Button>

            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">
              Verification Code
            </label>
            <div className="relative">
              <Input
                type={showOtp ? 'text' : 'password'}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-10"
                maxLength={6}
                onKeyDown={handleKeyPress}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowOtp(!showOtp)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showOtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-3">
              Didn&apos;t receive the code?
            </p>
            <button
              onClick={sendOTP}
              disabled={isLoading}
              className="text-blue-400 hover:text-blue-300 text-sm underline disabled:opacity-50"
            >
              Resend OTP
            </button>
          </div>

          <div className="space-y-3">
            <Button
              onClick={verifyOTP}
              disabled={isLoading || !otp.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify & Continue'
              )}
            </Button>

            <Button
              onClick={() => setStep('request')}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioOTPVerification;