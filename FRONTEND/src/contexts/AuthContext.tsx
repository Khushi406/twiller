"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// User interface
interface User {
  id: string
  email: string
  name: string
  username: string
  avatar?: string
  bio?: string
  verified: boolean
  createdAt: Date
}

// Auth context interface
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (userData: SignupData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
}

// Signup data interface
interface SignupData {
  email: string
  password: string
  name: string
  username: string
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setIsLoading(true)
      
      // Check localStorage for saved user data
      const savedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (savedUser && token) {
        const userData = JSON.parse(savedUser)
        
        // Validate token with backend (simulate API call)
        const isValid = await validateToken(token)
        
        if (isValid) {
          setUser({
            ...userData,
            createdAt: new Date(userData.createdAt)
          })
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('user')
          localStorage.removeItem('token')
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      // Clear invalid data
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Simulate API call
      const response = await loginAPI(email, password)
      
      if (response.success && response.user && response.token) {
        const userData = response.user
        const token = response.token
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', token)
        
        // Update state
        setUser(userData)
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: SignupData) => {
    try {
      setIsLoading(true)
      
      // Simulate API call
      const response = await signupAPI(userData)
      
      if (response.success && response.user && response.token) {
        const newUser = response.user
        const token = response.token
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(newUser))
        localStorage.setItem('token', token)
        
        // Update state
        setUser(newUser)
      } else {
        throw new Error(response.message || 'Signup failed')
      }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      
      // Call logout API to invalidate token on server
      await logoutAPI()
      
      // Clear localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      
      // Clear state
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Even if API call fails, clear local state
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (updatedData: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      setIsLoading(true)
      
      // Simulate API call
      const response = await updateUserAPI(updatedData)
      
      if (response.success) {
        const updatedUser = { ...user, ...response.user }
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Update state
        setUser(updatedUser)
      } else {
        throw new Error(response.message || 'Update failed')
      }
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

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

// Simulated API functions (replace with real API calls)
async function validateToken(token: string): Promise<boolean> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // For demo purposes, assume token is valid if it exists
  // In real app, make actual API call to validate
  return token.length > 0
}

async function loginAPI(email: string, password: string): Promise<{
  success: boolean
  user?: User
  token?: string
  message?: string
}> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate login validation
  if (email === 'demo@example.com' && password === 'password123') {
    return {
      success: true,
      user: {
        id: '1',
        email: email,
        name: 'Demo User',
        username: 'demo_user',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Just a demo user exploring X!',
        verified: true,
        createdAt: new Date('2024-01-01')
      },
      token: 'demo_token_' + Date.now()
    }
  }
  
  // For any other credentials, simulate successful login for demo
  return {
    success: true,
    user: {
      id: Math.random().toString(36).substr(2, 9),
      email: email,
      name: email.split('@')[0],
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'),
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&h=150&fit=crop&crop=face`,
      bio: 'New to X!',
      verified: false,
      createdAt: new Date()
    },
    token: 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
}

async function signupAPI(userData: SignupData): Promise<{
  success: boolean
  user?: User
  token?: string
  message?: string
}> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200))
  
  // Check if username already exists (simulate)
  const existingUsernames = ['admin', 'test', 'user']
  if (existingUsernames.includes(userData.username.toLowerCase())) {
    return {
      success: false,
      message: 'Username already exists'
    }
  }
  
  // Simulate successful signup
  return {
    success: true,
    user: {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      name: userData.name,
      username: userData.username,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&h=150&fit=crop&crop=face`,
      bio: 'New to X!',
      verified: false,
      createdAt: new Date()
    },
    token: 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
}

async function logoutAPI() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // In real app, invalidate token on server
  console.log('Token invalidated on server')
}

async function updateUserAPI(updatedData: Partial<User>): Promise<{
  success: boolean
  user?: Partial<User>
  message?: string
}> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Simulate successful update
  return {
    success: true,
    user: updatedData
  }
}