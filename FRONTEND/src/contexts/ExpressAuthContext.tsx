"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService, User, SignupData } from '../lib/apiService'

// Auth context interface
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: ((email: string, password: string) => Promise<void>) &
         ((token: string, user: User) => void)
  signup: (userData: SignupData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getCurrentUser()
      if (response && response.user) {
        setUser(response.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Login function
  const login = async (...args: [string, string] | [string, User]): Promise<void> => {
    // Case 1: Login with email and password
    if (typeof args[0] === 'string' && typeof args[1] === 'string' && args.length === 2) {
      const [email, password] = args;
      try {
        setIsLoading(true);
        const response = await apiService.login({ email, password });
        setUser(response.user);
        console.log('User logged in successfully:', response.user.email);
      } catch (error: unknown) {
        console.error('Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
    // Case 2: Set user directly with token and user object
    else if (typeof args[0] === 'string' && typeof args[1] === 'object' && args[1] !== null) {
      const [token, userObject] = args as [string, User];
      localStorage.setItem('token', token);
      setUser(userObject);
      console.log('User set from token:', userObject.email);
    }
  }

  // Signup function
  const signup = async (userData: SignupData): Promise<void> => {
    try {
      setIsLoading(true)
      const response = await apiService.signup(userData)
      setUser(response.user)
      console.log('User signed up successfully:', response.user.email)
    } catch (error: unknown) {
      console.error('Signup error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.'
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      await apiService.logout()
      setUser(null)
      console.log('User logged out successfully')
    } catch (error: unknown) {
      console.error('Logout error:', error)
      throw new Error('Logout failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No user logged in')

    try {
      setIsLoading(true)
      const response = await apiService.updateProfile(userData)
      setUser(response.user)
      console.log('User updated successfully')
    } catch (error: unknown) {
      console.error('Update user error:', error)
      throw new Error('Failed to update user profile.')
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext