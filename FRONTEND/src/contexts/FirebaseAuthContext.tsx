"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

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

// Helper function to create user document in Firestore
const createUserDocument = async (firebaseUser: FirebaseUser, additionalData: any = {}) => {
  if (!firebaseUser) return

  const userRef = doc(db, 'users', firebaseUser.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    const { email, displayName } = firebaseUser
    const createdAt = new Date()

    try {
      await setDoc(userRef, {
        email,
        name: displayName || additionalData.name || email?.split('@')[0] || 'User',
        username: additionalData.username || email?.split('@')[0] || 'user',
        avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&size=128&background=1da1f2&color=fff`,
        bio: '',
        verified: false,
        createdAt,
        ...additionalData
      })
    } catch (error) {
      console.error('Error creating user document:', error)
      throw error
    }
  }

  return getUserDocument(firebaseUser.uid)
}

// Helper function to get user document from Firestore
const getUserDocument = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      return {
        id: uid,
        email: userData.email,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        bio: userData.bio || '',
        verified: userData.verified || false,
        createdAt: userData.createdAt?.toDate() || new Date()
      }
    }
    return null
  } catch (error) {
    console.error('Error getting user document:', error)
    return null
  }
}

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Initialize Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true)
      
      if (firebaseUser) {
        // User is signed in
        const userData = await getUserDocument(firebaseUser.uid)
        setUser(userData)
      } else {
        // User is signed out
        setUser(null)
      }
      
      setIsLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true)
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
      
      // User data will be set by the auth state change listener
      console.log('User logged in successfully:', firebaseUser.email)
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Login failed. Please try again.'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.'
          break
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.'
          break
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.'
          break
        default:
          errorMessage = error.message || 'Login failed. Please try again.'
      }
      
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Signup function
  const signup = async (userData: SignupData): Promise<void> => {
    try {
      setIsLoading(true)
      const { email, password, name, username } = userData
      
      // Create Firebase user
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: name
      })
      
      // Create user document in Firestore
      await createUserDocument(firebaseUser, { name, username })
      
      console.log('User signed up successfully:', firebaseUser.email)
    } catch (error: any) {
      console.error('Signup error:', error)
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Signup failed. Please try again.'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.'
          break
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.'
          break
        default:
          errorMessage = error.message || 'Signup failed. Please try again.'
      }
      
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      await signOut(auth)
      setUser(null)
      console.log('User logged out successfully')
    } catch (error: any) {
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
      
      // Update Firestore document
      const userRef = doc(db, 'users', user.id)
      await updateDoc(userRef, userData)
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...userData } : null)
      
      console.log('User updated successfully')
    } catch (error: any) {
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