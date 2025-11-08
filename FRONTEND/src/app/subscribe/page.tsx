'use client';

import React from 'react';
import { useAuth } from '@/contexts/ExpressAuthContext';
import SubscribePage from '@/lib/page';

const SubscribePageRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to subscribe</h1>
        </div>
      </div>
    );
  }

  return <SubscribePage />;
};

export default SubscribePageRoute;
