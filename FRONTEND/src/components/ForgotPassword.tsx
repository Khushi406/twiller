'use client';

import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/apiService';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [resetMethod, setResetMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    otp: '',
    newPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [canRequestReset, setCanRequestReset] = useState(true);

  // Enhanced password generator function
  const generatePassword = (): string => {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';

    let password = '';
    const length = 10; // Increased length for better security

    // Ensure at least one uppercase and one lowercase
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];

    // Fill remaining characters with random mix
    for (let i = 2; i < length; i++) {
      const useUpper = Math.random() > 0.5;
      password += useUpper
        ? upperCase[Math.floor(Math.random() * upperCase.length)]
        : lowerCase[Math.floor(Math.random() * lowerCase.length)];
    }

    // Shuffle the password for better randomness
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({ ...prev, newPassword }));
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canRequestReset) {
      setError('You can only request password reset once per day. Please try again later.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await apiService.requestPasswordReset({
        method: resetMethod,
        value: resetMethod === 'email' ? formData.email : formData.phone
      });

      setMessage(response.message);
      setStep('reset');
      setCanRequestReset(false);

      // Store the timestamp to prevent multiple requests (24 hours)
      localStorage.setItem('lastPasswordReset', Date.now().toString());

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset code';
      setError(errorMessage);

      // Handle rate limiting specifically
      if (error instanceof Error && (
        errorMessage.includes('already requested') ||
        errorMessage.includes('RATE_LIMIT_EXCEEDED') ||
        errorMessage.includes('hour(s)')
      )) {
        setCanRequestReset(false);
        // Update localStorage with current time to align with backend
        localStorage.setItem('lastPasswordReset', Date.now().toString());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await apiService.resetPassword({
        method: resetMethod,
        value: resetMethod === 'email' ? formData.email : formData.phone,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      
      console.log('Password reset successful:', response);
      setMessage('Password reset successfully! You can now login with your new password.');
      
      // Redirect to login after success
      setTimeout(() => {
        onBack();
      }, 2000);
      
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user can request reset (once per day limitation)
  React.useEffect(() => {
    const lastReset = localStorage.getItem('lastPasswordReset');
    if (lastReset) {
      const lastResetTime = new Date(parseInt(lastReset));
      const now = new Date();
      const timeDiff = now.getTime() - lastResetTime.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);
      
      if (hoursDiff < 24) {
        setCanRequestReset(false);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </button>
          
          <h1 className="text-2xl font-bold mb-2">
            {step === 'request' ? 'Reset Password' : 'Enter New Password'}
          </h1>
          <p className="text-gray-400">
            {step === 'request' 
              ? 'Choose how you\'d like to receive your reset code'
              : 'Enter the code sent to your ' + resetMethod + ' and set a new password'
            }
          </p>
        </div>

        {message && (
          <div className="bg-green-600/20 border border-green-600 text-green-400 p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Reset Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setResetMethod('email')}
                  className={`p-3 rounded-lg border transition-colors flex items-center justify-center ${
                    resetMethod === 'email'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setResetMethod('phone')}
                  className={`p-3 rounded-lg border transition-colors flex items-center justify-center ${
                    resetMethod === 'phone'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </button>
              </div>
            </div>

            <div>
              <label htmlFor={resetMethod} className="block text-sm font-medium text-blue-400 mb-2 capitalize">
                {resetMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <Input
                id={resetMethod}
                type={resetMethod === 'email' ? 'email' : 'tel'}
                value={resetMethod === 'email' ? formData.email : formData.phone}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  [resetMethod]: e.target.value 
                }))}
                placeholder={resetMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                className="bg-gray-900/70 border-gray-600 text-white font-medium focus:bg-gray-900"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !canRequestReset}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}
            </Button>

            {!canRequestReset && (
              <p className="text-sm text-yellow-400 text-center">
                ⚠️ You can only request password reset once per day
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-blue-400 mb-2">
                Verification Code
              </label>
              <Input
                id="otp"
                type="text"
                value={formData.otp}
                onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                placeholder="Enter 6-digit code"
                className="bg-gray-900/70 border-gray-600 text-white font-medium focus:bg-gray-900"
                maxLength={6}
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-blue-400 mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                  className="bg-gray-900/70 border-gray-600 text-white font-medium focus:bg-gray-900 pr-20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                  title="Generate Password"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Click the refresh icon to generate a secure random password (10 characters, mixed case letters only)
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;