import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '@/lib/apiService';

interface LoginOTPVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  tempToken: string;
  email: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  onSuccess: (token: string, user: User) => Promise<void>;
}

const LoginOTPVerification: React.FC<LoginOTPVerificationProps> = ({
  isOpen,
  onClose,
  tempToken,
  email,
  deviceInfo,
  onSuccess
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempToken,
          otp: otpString
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      if (data.success) {
        onSuccess(data.token, data.user);
        onClose();
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsResending(true);
    setOtp(['', '', '', '', '', '']);

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      alert('New verification code sent to your email!');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Login
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            We&apos;ve sent a verification code to
          </p>
          <p className="text-blue-600 font-semibold mb-4">{email}</p>
        </div>

        {/* Device Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-600 mb-2">Login detected from:</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Browser:</span> {deviceInfo.browser}
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-semibold">OS:</span> {deviceInfo.os}
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-semibold">Device:</span> {deviceInfo.device}
            </p>
          </div>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Enter 6-digit code
          </label>
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || otp.join('').length !== 6}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-full font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 mb-4"
        >
          {isLoading ? 'Verifying...' : 'Verify & Login'}
        </button>

        {/* Resend */}
        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium disabled:text-gray-400"
          >
            {isResending ? 'Sending...' : "Didn&apos;t receive code? Resend"}
          </button>
        </div>

        {/* Timer info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Code expires in 10 minutes
        </p>
      </div>
    </div>
  );
};

export default LoginOTPVerification;
