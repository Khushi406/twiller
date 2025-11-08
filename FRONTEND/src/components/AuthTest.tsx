"use client"

import { useAuth } from '@/contexts/ExpressAuthContext'

export default function AuthTest() {
  const { user, isAuthenticated, logout } = useAuth()

  const clearAuth = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg border border-gray-700 z-50">
      <h3 className="font-bold mb-2">Auth Test Panel</h3>
      <div className="text-sm space-y-1">
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        {user && (
          <>
            <p><strong>User:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </>
        )}
      </div>
      <div className="mt-3 space-x-2">
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
        >
          Logout
        </button>
        <button
          onClick={clearAuth}
          className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-xs"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}