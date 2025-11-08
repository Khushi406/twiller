"use client"

import React, { useState } from 'react'
import { useAuth } from '@/contexts/ExpressAuthContext'
import { useTranslation } from 'react-i18next'
import Sidebar from './Sidebar'
import RightPanel from './RightPanel'
import ExpressFeed from './ExpressFeed'
import Header from './Header'


const Dashboard = () => {
  const { user, isLoading, logout } = useAuth()
  const { t } = useTranslation()
  const [currentView, setCurrentView] = useState('home')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl">Loading...</span>
        </div>
      </div>
    )
  }

  const getHeaderTitleKey = () => {
    switch (currentView) {
      case 'explore':
        return 'header.explore'
      case 'messages':
        return 'header.messages'
      case 'bookmarks':
        return 'header.bookmarks'
      case 'lists':
        return 'header.lists'
      case 'home':
      default:
        return 'header.home'
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case 'explore':
        return (
          <div className="p-8 text-center text-gray-400">
            <h2 className="text-2xl font-bold mb-4">{t('dashboard.explore')}</h2>
            <p>{t('dashboard.exploreDesc')}</p>
          </div>
        )
      case 'messages':
        return (
          <div className="p-8 text-center text-gray-400">
            <h2 className="text-2xl font-bold mb-4">{t('dashboard.messages')}</h2>
            <p>{t('dashboard.messagesDesc')}</p>
          </div>
        )
      case 'bookmarks':
        return (
          <div className="p-8 text-center text-gray-400">
            <h2 className="text-2xl font-bold mb-4">{t('dashboard.bookmarks')}</h2>
            <p>{t('dashboard.bookmarksDesc')}</p>
          </div>
        )
      case 'lists':
        return (
          <div className="p-8 text-center text-gray-400">
            <h2 className="text-2xl font-bold mb-4">{t('dashboard.lists')}</h2>
            <p>{t('dashboard.listsDesc')}</p>
          </div>
        )
      case 'home':
      default:
        return <ExpressFeed />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <div className="w-64 xl:w-80 flex-shrink-0">
          <Sidebar 
            user={user!} 
            onLogout={logout} 
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen border-x border-gray-800">
          <Header titleKey={getHeaderTitleKey()} />
          <div className="max-w-2xl mx-auto">
            {renderContent()}
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

export default Dashboard