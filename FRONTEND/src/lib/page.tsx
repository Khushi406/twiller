'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import PaymentModal from '@/components/PaymentModal';
import { apiService, User } from '@/lib/apiService';

// Define a type for the plan details
interface Plan {
  name: string;
  price: number;
  tweetLimit: number;
  duration: number;
}

interface Plans {
  [key: string]: Plan;
}

const SubscribePage = () => {
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const [allPlans, setAllPlans] = useState<Plans | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadInitialData = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Fetch current user data
          const userData = await apiService.getCurrentUser();
          if (!userData?.user) throw new Error('User not found');
          setUser(userData.user);

          // Fetch all available plans
          const plansData = await apiService.getSubscriptionPlans() as { plans: Plans };
          setAllPlans(plansData.plans);

        } catch (error) {
          console.error("Failed to load data:", error);
          // If user or plans fail to load, redirect to home or login
          router.push('/');
        }
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
      setLoading(false);
    };

    loadInitialData();
  }, [router]);

  const handleSelectPlan = (planKey: string) => {
    setSelectedPlanKey(planKey);
  };

  const handleCloseModal = () => {
    setSelectedPlanKey(null);
  };

  const handlePaymentSuccess = () => {
    console.log('Payment successful!');
    alert('Successfully subscribed!');
    // Redirect to profile or dashboard after successful payment
    router.push('/profile');
  };

  if (loading || !user || !allPlans) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading Subscription Page...
      </div>
    );
  }

  const selectedPlanDetails = selectedPlanKey ? allPlans[selectedPlanKey] : null;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <SubscriptionPlans onSelectPlan={handleSelectPlan} />

        {selectedPlanKey && selectedPlanDetails && (
          <PaymentModal
            planId={selectedPlanKey}
            planName={selectedPlanDetails.name}
            amount={selectedPlanDetails.price}
            onClose={handleCloseModal}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </main>
  );
};

export default SubscribePage;