"use client"

import Landing from "@/components/Landing";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";
import { useAuth } from "@/contexts/ExpressAuthContext";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl">{t('home.loading')}</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <Login />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Dashboard />
    </div>
  );
}
