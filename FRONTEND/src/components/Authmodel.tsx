"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
 
import { useAuth } from '@/contexts/ExpressAuthContext'
import ForgotPassword from './ForgotPassword'
import InputField from '@/components/ui/InputField';

interface AuthModalProps {
  isopen: boolean
  onClose: () => void
  ininitalmode?: 'login' | 'signup'
}

const Authmodel = ({ isopen, onClose, ininitalmode = "login" }: AuthModalProps) => {
  const { login, signup } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(ininitalmode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isopen) {
      setMode(ininitalmode); // Sync with the mode passed from Landing page
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        username: ''
      });
      setErrors({});
    }
  }, [isopen, ininitalmode])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isopen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isopen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Signup specific validations
    if (mode === 'signup') {
      if (!formData.name) {
        newErrors.name = 'Name is required'
      }
      if (!formData.username) {
        newErrors.username = 'Username is required'
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters'
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        onClose();
        router.push('/');
      } else {
        await signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          username: formData.username
        });
        onClose();
        router.push('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      // For now, simulate with demo login
  await login('demo@example.com', 'password123')
  onClose()
  router.push('/')
    } catch (error) {
      console.error('Google auth error:', error)
      setErrors({ general: 'Google authentication failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleAuth = async () => {
    setIsLoading(true)
    try {
      // For now, simulate with demo login
  await login('demo@example.com', 'password123')
  onClose()
  router.push('/')
    } catch (error) {
      console.error('Apple auth error:', error)
      setErrors({ general: 'Apple authentication failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isopen) return null

  // Show forgot password component if in forgot mode
  if (mode === 'forgot') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <ForgotPassword onBack={() => setMode('login')} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-black border border-gray-700 rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {/* X Logo */}
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 fill-current text-white"
              aria-hidden="true"
            >
              <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133l-9.695-13.821zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246l-6.453-9.037z"/>
            </svg>
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' ? 'Sign in to X' : 'Join X today'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Social Auth Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full bg-white text-black font-medium py-3 px-6 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{mode === 'login' ? 'Sign in' : 'Sign up'} with Google</span>
            </button>

            <button
              onClick={handleAppleAuth}
              disabled={isLoading}
              className="w-full bg-white text-black font-medium py-3 px-6 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
              <span>{mode === 'login' ? 'Sign in' : 'Sign up'} with Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {errors.general}
              </div>
            )}

            {/* Name Field (Signup only) */}
            {mode === 'signup' && (
              <InputField
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
              />
            )}

            {/* Username Field (Signup only) */}
            {mode === 'signup' && (
              <InputField
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
              />
            )}

            {/* Email Field */}
            <InputField
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
            />

            {/* Password Field */}
            <InputField
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
            />

            {/* Confirm Password Field (Signup only) */}
            {mode === 'signup' && (
              <InputField
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
              />
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white font-medium py-3 px-6 rounded-full hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {/* Loading Spinner */}
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <span>{mode === 'login' ? 'Sign in' : 'Create account'}</span>
              )}
            </button>
          </form>

          {/* Terms (Signup only) */}
          {mode === 'signup' && (
            <p className="text-xs text-gray-500 leading-relaxed text-center">
              By signing up, you agree to the{' '}
              <a href="#" className="text-blue-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-400 hover:underline">
                Privacy Policy
              </a>
              , including{' '}
              <a href="#" className="text-blue-400 hover:underline">
                Cookie Use
              </a>
              .
            </p>
          )}

          {/* Mode Switch */}
          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-gray-400">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-blue-400 hover:underline font-medium"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Forgot Password (Login only) */}
          {mode === 'login' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                }}
                className="text-blue-400 hover:underline text-sm"
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Authmodel
