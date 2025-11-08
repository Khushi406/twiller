import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface OtpPromptProps {
  onSubmit: (otp: string) => Promise<void>;
  onClose: () => void;
  error?: string;
  email: string;
  userId?: string;
}

const OtpPrompt: React.FC<OtpPromptProps> = ({ onSubmit, onClose, error, email }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!otp.trim()) {
      setLocalError('OTP is required');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(otp);
    } catch (err: unknown) {
      const error = err as Error;
      setLocalError(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-black text-white rounded-lg shadow-lg p-8 w-full max-w-sm relative border border-gray-700">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-2">Enter OTP</h2>
        <p className="mb-4 text-sm text-gray-600">An OTP has been sent to <span className="font-semibold">{email}</span>. Please enter it below to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter OTP"
            maxLength={6}
            autoFocus
          />
          {(localError || error) && <div className="text-red-600 text-sm mb-2">{localError || error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OtpPrompt;
