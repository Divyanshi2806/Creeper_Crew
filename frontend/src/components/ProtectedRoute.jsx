// ProtectedRoute.jsx — Wrapper that redirects to login if not authenticated
// Also checks role: teachers can't access admin pages and vice versa

import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  // Still checking localStorage — show nothing yet
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          {/* Spinning loader */}
          <div className="w-10 h-10 border-4 border-[#EDE9FE] border-t-[#7C3AED] rounded-full animate-spin" />
          <p className="text-[#6B7280] text-sm font-medium">Loading EduEase...</p>
        </div>
      </div>
    )
  }

  // Not logged in — send to login page
  if (!user) return <Navigate to="/login" replace />

  // Wrong role — redirect to their correct dashboard
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return children
}