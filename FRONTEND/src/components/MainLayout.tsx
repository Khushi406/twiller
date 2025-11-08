"use client"

import React from 'react'
import { useAuth } from '@/contexts/ExpressAuthContext'
import Sidebar from './Sidebar'
import RightPanel from './RightPanel'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <div className="w-64 xl:w-80 flex-shrink-0">
          <Sidebar user={user} onLogout={logout} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen border-x border-gray-800">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <RightPanel />
        </div>
      </div>
    </div>
  )
}

export default MainLayout