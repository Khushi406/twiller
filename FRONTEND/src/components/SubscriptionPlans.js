import React, { useState, useEffect } from 'react';

// This would typically be in a separate api service file
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const SubscriptionPlans = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${API_URL}/subscriptions/plans`);
        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }
        const data = await response.json();
        // We don't want to show the 'free' plan as an upgrade option
        delete data.plans.free;
        setPlans(data.plans);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading plans...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">Error: {error}</div>;
  }

  const planOrder = ['bronze', 'silver', 'gold'];

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planOrder.map((planKey) => {
          const plan = plans[planKey];
          if (!plan) return null;

          return (
            <div key={planKey} className="border border-gray-700 rounded-lg p-6 flex flex-col text-center bg-gray-800 hover:border-blue-500 transition-colors">
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-4xl font-bold mb-4">
                ₹{plan.price}
                <span className="text-lg font-normal text-gray-400">/month</span>
              </p>
              <ul className="text-left space-y-2 mb-6 flex-grow">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>
                    {plan.tweetLimit === -1 ? 'Unlimited Tweets' : `${plan.tweetLimit} Tweets per month`}
                  </span>
                </li>
                {/* Add other plan features here */}
              </ul>
              <button
                onClick={() => onSelectPlan(planKey)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-auto"
              >
                Subscribe
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;