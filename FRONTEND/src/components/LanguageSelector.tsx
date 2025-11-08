"use client"

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/InputField";
import { useAuth } from '@/contexts/ExpressAuthContext';
import { apiService } from '@/lib/apiService';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const handleLanguageSelect = async (languageCode: string) => {
    if (!user) {
      alert('Please log in to change language');
      return;
    }

    setSelectedLanguage(languageCode);
    setError(null);
    setOtp('');
    setPhone('');
    setLoading(true);

    try {
      // Send OTP for language verification
      const data = await apiService.sendLanguageOTP(languageCode);
      
      // Check the verification type from response
      if (data.verificationType === 'phone') {
        setVerificationType('phone');
      } else if (data.verificationType === 'email') {
        setVerificationType('email');
      }
      
      setShowOtpDialog(true);
    } catch (error) {
      console.error('Error sending OTP:', error);

      // Check if phone is required
      if ((error as Error).message?.includes('Phone number is required')) {
        setVerificationType('phone');
        setShowPhoneDialog(true);
        return;
      }

      // Check if email is required
      if ((error as Error).message?.includes('Email address is required')) {
        alert((error as Error).message || 'Email address is required to switch to French. Please add an email to your account.');
        return;
      }

      alert((error as Error).message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLanguage || !otp.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Verify OTP
      await apiService.verifyLanguageOTP(selectedLanguage!, otp);

      // Change language after successful verification
      i18n.changeLanguage(selectedLanguage).then(() => {
        // Store the language preference
        localStorage.setItem('i18nextLng', selectedLanguage);
        // Refresh the page to ensure all components re-render with new language
        router.refresh();
      }).catch((error) => {
        console.error('Error changing language:', error);
      });
      setShowOtpDialog(false);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError((error as Error).message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLanguage || !phone.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Send phone OTP
      await apiService.sendPhoneOTP(phone);
      setShowPhoneDialog(false);
      setShowOtpDialog(true);
    } catch (error) {
      console.error('Error sending phone OTP:', error);
      setError((error as Error).message || 'Failed to send phone OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLanguage || !otp.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Verify language OTP (phone-based)
      await apiService.verifyLanguageOTP(selectedLanguage, otp);

      // Change language after successful verification
      i18n.changeLanguage(selectedLanguage).then(() => {
        // Store the language preference
        localStorage.setItem('i18nextLng', selectedLanguage);
        // Refresh the page to ensure all components re-render with new language
        router.refresh();
      }).catch((error) => {
        console.error('Error changing language:', error);
      });
      setShowOtpDialog(false);
    } catch (error) {
      console.error('Error verifying phone OTP:', error);
      setError((error as Error).message || 'Failed to verify phone OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowOtpDialog(false);
    setShowPhoneDialog(false);
    setSelectedLanguage(null);
    setOtp('');
    setPhone('');
    setError(null);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const selectedLanguageName = selectedLanguage ? languages.find(lang => lang.code === selectedLanguage)?.name : '';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            <span className="text-lg">{currentLanguage.flag}</span>
            <span className="text-sm text-gray-400 hidden xl:block">{currentLanguage.name}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-black border-gray-600/20 text-white shadow-lg">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`cursor-pointer hover:bg-gray-700 focus:bg-gray-700 ${
                i18n.language === language.code ? 'bg-gray-700' : ''
              }`}
              disabled={loading}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPhoneDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px] bg-black text-white border-gray-600">
          <DialogHeader>
            <DialogTitle>Phone Verification Required</DialogTitle>
            <DialogDescription>
              Phone verification is required to change your language to {selectedLanguageName}. Please enter your phone number.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <InputField
                type="tel"
                name="phone"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={error || undefined}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !phone.trim()}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showOtpDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px] bg-black text-white border-gray-600">
          <DialogHeader>
            <DialogTitle>Verify Language Change</DialogTitle>
            <DialogDescription>
              {verificationType === 'phone'
                ? `An OTP has been sent to ${phone}. Please enter it below to confirm changing your language to ${selectedLanguageName}.`
                : `An OTP has been sent to your email. Please enter it below to confirm changing your language to ${selectedLanguageName}.`
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={verificationType === 'phone' ? handlePhoneOtpSubmit : handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">
                Enter OTP
              </label>
              <InputField
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                error={error || undefined}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !otp.trim()}>
                {loading ? 'Verifying...' : 'Verify & Change'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LanguageSelector;
