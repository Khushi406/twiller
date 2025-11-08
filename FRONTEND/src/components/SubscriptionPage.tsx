"use client"

import React, { useState, useEffect } from 'react'
import { Crown, X, CheckCircle } from 'lucide-react'
import SubscriptionPlan from './SubscriptionPlan'
import PaymentModal from './PaymentModal'
import { apiService } from '@/lib/apiService'
import { useToast } from '@/components/ui/use-toast'

interface Plan {
  id: string
  name: string
  price: number
  tweetLimit: number | string
  features: string[]
  popular?: boolean
}

const SubscriptionPage = ({ onClose }: { onClose: () => void }) => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      const [plansResponse, statusResponse] = await Promise.all([
        apiService.getSubscriptionPlans(),
        apiService.getSubscriptionStatus()
      ])

      // Transform backend plans to frontend format
      const transformedPlans: Plan[] = Object.entries(plansResponse.plans).map(([key, plan]: [string, any]) => ({
        id: key,
        name: plan.name,
        price: plan.price,
        tweetLimit: plan.tweetLimit === -1 ? 'unlimited' : plan.tweetLimit,
        features: [
          `${plan.tweetLimit === -1 ? 'Unlimited' : plan.tweetLimit} tweets per month`,
          'Priority support',
          'Advanced analytics',
          'Custom themes',
          'No ads'
        ],
        popular: key === 'silver'
      }))

      setPlans(transformedPlans)
      setSubscriptionStatus(statusResponse)
    } catch (error) {
      console.error('Failed to load subscription data:', error)
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handleSubscribe = () => {
    if (!selectedPlan) {
      toast({
        title: "Select a Plan",
        description: "Please select a subscription plan to continue",
        variant: "destructive",
      })
      return
    }

    const plan = plans.find(p => p.id === selectedPlan)
    if (!plan) return

    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    loadSubscriptionData() // Refresh subscription status
    toast({
      title: "Subscription Activated!",
      description: "Your subscription has been successfully activated.",
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-4xl mx-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              <Crown className="w-6 h-6 text-yellow-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Subscription Status */}
          {subscriptionStatus && (
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {subscriptionStatus.subscription.plan} Plan
                  </p>
                  <p className="text-sm text-gray-600">
                    {subscriptionStatus.remainingTweets === 'unlimited'
                      ? 'Unlimited tweets remaining'
                      : `${subscriptionStatus.remainingTweets} tweets remaining`
                    }
                  </p>
                </div>
                {subscriptionStatus.subscription.plan !== 'free' && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
            </div>
          )}

          {/* Plans Grid */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {plans.map((plan) => (
                <SubscriptionPlan
                  key={plan.id}
                  plan={plan}
                  onSelect={handlePlanSelect}
                  isSelected={selectedPlan === plan.id}
                />
              ))}
            </div>

            {/* Subscribe Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubscribe}
                disabled={!selectedPlan}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center"
              >
                <Crown className="w-5 h-5 mr-2" />
                Subscribe to {selectedPlanData?.name || 'Selected Plan'}
              </button>
            </div>

            {/* Features Comparison */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-900 text-center mb-8">
                Why Choose Premium?
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Free Plan</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 1 tweet per month</li>
                    <li>• Basic features</li>
                    <li>• Community support</li>
                    <li>• Ads included</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Premium Plans</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• More tweets per month</li>
                    <li>• Priority support</li>
                    <li>• Advanced analytics</li>
                    <li>• Custom themes</li>
                    <li>• Ad-free experience</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlanData && (
        <PaymentModal
          planId={selectedPlan}
          planName={selectedPlanData.name}
          amount={selectedPlanData.price}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}

export default SubscriptionPage
