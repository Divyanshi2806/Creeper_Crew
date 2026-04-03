// LoginPage.jsx — First page users see
// Handles teacher and admin login with JWT

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/utils/api'
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react'
import ErrorMessage from '@/components/ErrorMessage'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Form state
  const [role,     setRole]     = useState('teacher') // 'teacher' | 'admin'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // POST /api/auth/login
      const res = await api.post('/auth/login', { email, password, role })
      const { token, user } = res.data

      // Save to context + localStorage
      login(user, token)

      // Redirect based on role
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true })

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Quick-fill demo credentials
  const fillDemo = (demoRole) => {
    setRole(demoRole)
    if (demoRole === 'admin') {
      setEmail('admin@eduease.com')
      setPassword('admin123')
    } else {
      setEmail('priya@eduease.com')
      setPassword('teacher123')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">

      {/* ── Left Panel — Branding ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#7C3AED] flex-col justify-between p-12 relative overflow-hidden">

        {/* Background decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-8 w-48 h-48 bg-white/5 rounded-full" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">EduEase</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-6">
            Teaching<br />
            <span className="text-[#C4B5FD]">made lighter.</span>
          </h1>
          <p className="text-purple-200 text-lg leading-relaxed max-w-sm">
            Automate attendance, generate AI-powered reports,
            and spot struggling students — before it's too late.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-3">
            {[
              'One-click attendance with voice input',
              'AI progress reports in seconds',
              'Early intervention alerts',
              'Learning gap heatmaps',
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-purple-100">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-purple-300 text-sm relative z-10">
          Built for teachers. Designed to save time.
        </p>
      </div>

      {/* ── Right Panel — Login Form ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[#1A1A2E]">EduEase</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-[#1A1A2E] mb-1">Welcome back</h2>
          <p className="text-[#6B7280] mb-8">Sign in to your account to continue.</p>

          {/* ── Role Toggle ─────────────────────────────── */}
          <div className="flex gap-2 p-1 bg-[#F3F4F6] rounded-xl mb-6">
            {['teacher', 'admin'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                  role === r
                    ? 'bg-white text-[#7C3AED] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
              >
                {r === 'teacher' ? '👩‍🏫 Teacher' : '🛡️ Admin'}
              </button>
            ))}
          </div>

          {/* ── Error Message ───────────────────────────── */}
          <ErrorMessage message={error} />

          {/* ── Login Form ──────────────────────────────── */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@eduease.com"
                required
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all pr-12"
                />
                {/* Show/hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A2E]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#7C3AED] hover:bg-[#5B21B6] disabled:bg-[#C4B5FD] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                `Sign in as ${role === 'teacher' ? 'Teacher' : 'Admin'}`
              )}
            </button>
          </form>

          {/* ── Demo Credentials ─────────────────────────── */}
          <div className="mt-8 p-4 bg-[#F5F3FF] rounded-xl border border-[#EDE9FE]">
            <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wide mb-3">
              Demo Credentials
            </p>
            <div className="space-y-2">
              <button
                onClick={() => fillDemo('teacher')}
                className="w-full text-left px-3 py-2 bg-white rounded-lg border border-[#EDE9FE] hover:border-[#7C3AED] transition-colors"
              >
                <p className="text-xs font-medium text-[#1A1A2E]">👩‍🏫 Teacher — Priya Mehta</p>
                <p className="text-xs text-[#6B7280]">priya@eduease.com / teacher123</p>
              </button>
              <button
                onClick={() => fillDemo('admin')}
                className="w-full text-left px-3 py-2 bg-white rounded-lg border border-[#EDE9FE] hover:border-[#7C3AED] transition-colors"
              >
                <p className="text-xs font-medium text-[#1A1A2E]">🛡️ Admin — Principal Sharma</p>
                <p className="text-xs text-[#6B7280]">admin@eduease.com / admin123</p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}