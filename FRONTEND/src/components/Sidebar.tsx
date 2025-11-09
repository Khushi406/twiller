"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface User {
  id: string
  email: string
  name: string
  username: string
  avatar?: string
  bio?: string
  verified: boolean
  createdAt: Date
}

interface SidebarProps {
  user: User
  onLogout: () => void
  currentView?: string
  onViewChange?: (view: string) => void
}

const Sidebar = ({ user, onLogout, currentView = 'home', onViewChange }: SidebarProps) => {
  const [activeTab, setActiveTab] = useState(currentView)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()

  useEffect(() => {
    // Update active tab based on current pathname
    if (pathname === '/profile') {
      setActiveTab('profile')
    } else if (pathname === '/notifications') {
      setActiveTab('notifications')
    } else if (pathname === '/') {
      setActiveTab('home')
    } else {
      setActiveTab('home') // Default to home for other routes
    }
  }, [pathname])

  const navigationItems = [
    {
      id: 'home',
      name: t('header.home'),
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.03998L2.11997 11.92C1.72997 12.31 1.72997 12.94 2.11997 13.33C2.50997 13.72 3.13997 13.72 3.52997 13.33L12 4.85998L20.47 13.33C20.86 13.72 21.49 13.72 21.88 13.33C22.27 12.94 22.27 12.31 21.88 11.92L12 2.03998Z"/>
          <path d="M12 5.27L19 12.27V20C19 20.55 18.55 21 18 21H15C14.45 21 14 20.55 14 20V14H10V20C10 20.55 9.55 21 9 21H6C5.45 21 5 20.55 5 20V12.27L12 5.27Z"/>
        </svg>
      )
    },
    {
      id: 'explore',
      name: t('header.explore'),
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      id: 'notifications',
      name: t('header.notifications'),
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zm-8-8v8a2 2 0 002 2h6l5-5V7a2 2 0 00-2-2H9a2 2 0 00-2 2z" />
        </svg>
      ),
      badge: 3
    },
    {
      id: 'bookmarks',
      name: t('header.bookmarks'),
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    },
    {
      id: 'lists',
      name: t('header.lists'),
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ]

  return (
    <div className="fixed top-0 left-0 h-full w-64 xl:w-80 bg-black border-r border-gray-600/20 p-4">
      {/* Logo */}
      <div className="mb-8 px-3">
        <div className="flex items-center space-x-3 text-white">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 fill-current text-white"
            aria-hidden="true"
          >
            <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133l-9.695-13.821zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246l-6.453-9.037z"/>
          </svg>
          <span className="text-2xl font-bold hidden xl:block">Twiller</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 mb-8">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (item.id === 'profile') {
                router.push('/profile');
              } else if (item.id === 'notifications') {
                router.push('/notifications');
              } else if (onViewChange) {
                onViewChange(item.id);
              }
            }}
            className={`w-full flex items-center space-x-4 px-3 py-3 rounded-full transition-all duration-200 hover:bg-white/10 ${
              activeTab === item.id ? 'bg-white/10 font-semibold' : 'font-normal'
            }`}
          >
            <div className="relative">
              <div className={`transition-colors duration-200 ${
                activeTab === item.id ? 'text-white' : 'text-gray-400'
              }`}>
                {item.icon}
              </div>
              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-[#1D9BF0] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-xl hidden xl:block transition-colors duration-200 ${
              activeTab === item.id ? 'text-white' : 'text-gray-400'
            }`}>
              {item.name}
            </span>
          </button>
        ))}
        {/* More button - Placeholder for future features */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`w-full flex items-center space-x-4 px-3 py-3 rounded-full transition-all duration-200 hover:bg-white/10`}
            >
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              <span className="text-xl hidden xl:block text-gray-400">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-black border-gray-600/20 text-white shadow-lg">
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              More options coming soon...
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Tweet Button */}
      <div className="mb-8">
        <button className="w-full bg-[#1D9BF0] hover:bg-[#1A91DA] text-white font-bold py-3 px-6 rounded-full transition-all duration-200 xl:block hidden shadow-lg hover:shadow-xl">
          Tweet
        </button>
        <button className="w-12 h-12 bg-[#1D9BF0] hover:bg-[#1A91DA] text-white font-bold rounded-full transition-all duration-200 xl:hidden flex items-center justify-center shadow-lg hover:shadow-xl">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>

      {/* User Profile */}
      <div className="absolute bottom-4 left-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center justify-between p-3 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Image
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1DA1F2&color=ffffff`}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-transparent hover:ring-white/20 transition-all duration-200"
                />
                <div className="hidden xl:block">
                  <p className="font-medium text-sm text-white">{user.name}</p>
                  <p className="text-gray-500 text-sm">@{user.username}</p>
                </div>
              </div>
              <div className="hidden xl:block">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-black border-gray-600/20 text-white shadow-lg mb-2" side="top">
            <DropdownMenuItem
              onClick={() => router.push('/login-history')}
              className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700 py-3 px-4"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Login History</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/settings')}
              className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700 py-3 px-4"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </div>
            </DropdownMenuItem>
            <div className="border-t border-gray-700 my-1"></div>
            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700 py-3 px-4"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Log out @{user.username}</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default Sidebar