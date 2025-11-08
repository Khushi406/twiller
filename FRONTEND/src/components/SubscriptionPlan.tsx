"use client"

import React from 'react'
import { Check } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  tweetLimit: number | string
  features: string[]
  popular?: boolean
}

interface SubscriptionPlanProps {
  plan: Plan
  onSelect: (planId: string) => void
  isSelected?: boolean
}

const SubscriptionPlan = ({ plan, onSelect, isSelected }: SubscriptionPlanProps) => {
  return (
    <div
      className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onSelect(plan.id)}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <div className="mt-4">
          <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
          <span className="text-gray-500">/month</span>
        </div>
        <p className="mt-2 text-gray-600">
          {plan.tweetLimit === 'unlimited' ? 'Unlimited tweets' : `${plan.tweetLimit} tweets per month`}
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
          isSelected
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(plan.id)
        }}
      >
        {isSelected ? 'Selected' : 'Select Plan'}
      </button>
    </div>
  )
}

export default SubscriptionPlan
