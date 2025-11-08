"use client"

import { useState } from 'react'
import Login from '@/components/Login'
import OtpPrompt from '@/components/OtpPrompt'

export default function AuthPage() {
  const [showOtpPrompt, setShowOtpPrompt] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')

  const handleBackToLogin = () => {
    setShowOtpPrompt(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        {!showOtpPrompt ? (
          <Login />
        ) : (
          <OtpPrompt
            email={otpEmail}
            onSubmit={async (otp: string) => {
              // Handle OTP verification here
              console.log('OTP submitted:', otp);
              // You can add API call here
            }}
            onClose={handleBackToLogin}
          />
        )}
      </div>
    </div>
  )
}
