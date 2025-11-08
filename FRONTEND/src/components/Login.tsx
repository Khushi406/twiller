import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, User } from '../lib/apiService';
import { useAuth } from '@/contexts/ExpressAuthContext';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import LoginOTPVerification from './LoginOTPVerification';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // OTP verification state
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [deviceInfo, setDeviceInfo] = useState({
    browser: '',
    os: '',
    device: ''
  });
  
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Check if OTP is required
      if (data.requiresOTP) {
        setTempToken(data.tempToken);
        setDeviceInfo(data.deviceInfo);
        setShowLoginForm(false);
        setShowOTPVerification(true);
      } else if (data.restriction === 'time_restricted') {
        // Time restriction for mobile
        setError(data.message);
      } else {
        // Direct login allowed
        await login(data.token, data.user);
        router.push('/');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = async (token: string, user: User) => {
    await login(token, user);
    setShowOTPVerification(false);
    router.push('/');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiService.signup({
        email,
        password,
        name,
        username
      });
      // Set auth state and redirect
  await login(response.token, response.user as User);
      router.push('/');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Disable background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showLoginForm || showSignupForm ? 'hidden' : 'auto';
  }, [showLoginForm, showSignupForm]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center w-full max-w-6xl px-6 md:px-12">
        {/* Left Section: Logo */}
        <div className="flex-1 flex items-center justify-center mb-8 md:mb-0">
          <Image
            src="/x-logo.svg"
            alt="X Logo"
            width={400}
            height={400}
            className="object-contain w-64 h-64 md:w-96 md:h-96 opacity-80"
          
          />
        </div>

        {/* Right Section: Login Options */}
        <div className="flex-1 text-white p-4 md:p-8 max-w-md md:max-w-none">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center md:text-left">
            {t('login.happeningNow')}
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center md:text-left">
            {t('login.joinToday')}
          </h2>

          <div className="space-y-4">
            <button className="w-full bg-white text-black py-3 px-4 rounded-full flex items-center justify-center font-semibold hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-xl">
              <Image
                src="/google-icon.svg"
                alt="Google Icon"
                width={20}
                height={20}
                className="mr-3"
              />
              {t('login.signUpWithGoogle')}
            </button>

            <button className="w-full bg-white text-black py-3 px-4 rounded-full flex items-center justify-center font-semibold hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 384 512"
                fill="black"
                className="mr-3"
              >
                <path d="M318.7 268.7c-.2-37.3 16.4-65.7 50-86.4-18.8-26.7-47.2-41.4-84.2-44-35.4-2.5-74.2 20.7-88.3 20.7-14.6 0-49.3-19.9-76.5-19.9C77.2 139.1 0 196.5 0 313.6c0 64.8 23.7 133.8 52.9 178.2 24.8 36.9 54.4 78.3 93.2 76.8 37.3-1.5 51.4-24.3 96.3-24.3 44.4 0 57.3 24.3 96.9 23.6 40.4-.7 66.1-37.5 90.6-74.7 27.8-41.1 39.3-80.8 39.8-82.9-1-.5-75.9-29.2-76-115.6zM259.3 85.8c27.2-32.5 45.5-77.7 40.4-122.8-39 1.6-85.9 26-113.9 58.4-25 28.7-47 74.6-41 118.7 43.6 3.4 87.3-22 114.5-54.3z"/>
              </svg>
              {t('login.signUpWithApple')}
            </button>

            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="px-2 text-gray-400 text-sm">or</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <button
              onClick={() => setShowSignupForm(true)}
              className="w-full bg-white text-black py-3 px-4 rounded-full font-semibold hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-xl"
            >
              {t('login.createAccount')}
            </button>
          </div>

          <div className="mt-8 text-center text-gray-400 text-sm">
            By signing up, you agree to the{' '}
            <a href="/terms" className="text-blue-500 hover:underline">
              {t('login.terms')}
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-500 hover:underline">
              {t('login.privacy')}
            </a>
            , including{' '}
            <a href="/cookies" className="text-blue-500 hover:underline">
              {t('login.cookies')}
            </a>
            .
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">{t('login.alreadyHaveAccount')}</p>
            <button
              onClick={() => setShowLoginForm(true)}
              className="bg-transparent border border-gray-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-gray-700 transition-all duration-200"
            >
              {t('login.signIn')}
            </button>
          </div>
        </div>
      </div>

      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black text-white rounded-lg p-8 w-full max-w-md border border-gray-700">
            <h2 className="text-2xl font-bold text-black mb-6 text-center">{t('login.signInToX')}</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-400 mb-1">{t('login.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-900/70 placeholder-gray-500 text-white font-medium"
                  placeholder={t('login.enterEmail')}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-400 mb-1">{t('login.password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-900/70 placeholder-gray-500 text-white font-medium"
                  placeholder={t('login.enterPassword')}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  className="text-blue-500 hover:underline text-sm"
                  onClick={() => router.push('/forgot-password')}
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
              >
                {isLoading ? t('login.signingIn') : t('login.signIn')}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowLoginForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSignupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black text-white rounded-lg p-8 w-full max-w-md border border-gray-700">
            <h2 className="text-2xl font-bold text-black mb-6 text-center">{t('login.createAccount')}</h2>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-400 mb-1">{t('login.name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-900/70 placeholder-gray-500 text-white font-medium"
                  placeholder={t('login.enterName')}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-400 mb-1">{t('login.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-900/70 placeholder-gray-500 text-white font-medium"
                  placeholder={t('login.enterEmail')}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-400 mb-1">{t('login.username')}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-900/70 placeholder-gray-500 text-white font-medium"
                  placeholder={t('login.chooseUsername')}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-400 mb-1">{t('login.password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-900/70 placeholder-gray-500 text-white font-medium"
                  placeholder={t('login.createPassword')}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
              >
                {isLoading ? t('login.creatingAccount') : t('login.createAccount')}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowSignupForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      <LoginOTPVerification
        isOpen={showOTPVerification}
        onClose={() => {
          setShowOTPVerification(false);
          setTempToken('');
        }}
        tempToken={tempToken}
        email={email}
        deviceInfo={deviceInfo}
        onSuccess={handleOTPSuccess}
      />
    </div>
  );
};

export default Login;
