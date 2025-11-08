"use client"

import React, { useState, useEffect } from 'react'
import { X, CreditCard, Clock } from 'lucide-react'
import { apiService } from '@/lib/apiService'
import { useToast } from '@/components/ui/use-toast'
import { isPaymentTimeAllowed, getNextPaymentTime } from '@/utils/timeUtils'

interface PaymentModalProps {
  planId: string
  planName: string
  amount: number
  onClose: () => void
  onSuccess: () => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

const PaymentModal = ({ planId, planName, amount, onClose, onSuccess }: PaymentModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [paymentAllowed, setPaymentAllowed] = useState(false)
  const [nextPaymentTime, setNextPaymentTime] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    // Check payment time restrictions
    const allowed = isPaymentTimeAllowed()
    setPaymentAllowed(allowed)
    if (!allowed) {
      setNextPaymentTime(getNextPaymentTime())
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (!paymentAllowed) {
      toast({
        title: "Payment Not Available",
        description: `Payments are only allowed between 10:00 AM - 11:00 AM IST. Next available time: ${nextPaymentTime}`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Create order
      const response = await apiService.createSubscriptionOrder(planId)
      setOrderData(response.order)

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'your_razorpay_key_id',
        amount: response.order.amount,
        currency: response.order.currency,
        name: 'Twiller',
        description: `${planName} Subscription`,
        order_id: response.order.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            await apiService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              planType: planId
            })

            toast({
              title: "Payment Successful!",
              description: "Your subscription has been activated.",
            })

            onSuccess()
            onClose()
          } catch (error) {
            console.error('Payment verification failed:', error)
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if money was debited.",
              variant: "destructive",
            })
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
        },
        theme: {
          color: '#1DA1F2',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('Payment initialization failed:', error)
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to initialize payment. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Plan Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">{planName}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">₹{amount}/month</p>
          </div>

          {/* Time Restriction Notice */}
          <div className={`border p-3 rounded-lg ${paymentAllowed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center">
              <Clock className={`w-5 h-5 mr-2 ${paymentAllowed ? 'text-green-600' : 'text-yellow-600'}`} />
              <div>
                <p className={`text-sm font-medium ${paymentAllowed ? 'text-green-800' : 'text-yellow-800'}`}>
                  {paymentAllowed ? 'Payment Available Now' : 'Payment Not Available'}
                </p>
                <p className={`text-xs ${paymentAllowed ? 'text-green-700' : 'text-yellow-700'}`}>
                  {paymentAllowed
                    ? 'Payments are available between 10:00 AM - 11:00 AM IST'
                    : `Payments are only available between 10:00 AM - 11:00 AM IST. Next available: ${nextPaymentTime}`
                  }
                </p>
              </div>
            </div>
  )
}

export default PaymentModal
