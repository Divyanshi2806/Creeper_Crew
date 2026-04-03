// TeacherDashboard.jsx — Main page teachers see after login
// Shows stats, schedule, burnout widget, and recent alerts

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import StatCard from '@/components/StatCard'
import BurnoutWidget from '@/components/BurnoutWidget'
import ScheduleCard from '@/components/ScheduleCard'
import AlertPreviewCard from '@/components/AlertPreviewCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import { useDashboard } from '@/hooks/useDashboard'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/context/AuthContext'
import {
  Users, ClipboardCheck, AlertTriangle,
  Calendar, ArrowRight, Wifi, WifiOff, Bell
} from 'lucide-react'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useDashboard()
  const { alerts, connected } = useSocket()

  // Live alerts — start with empty, fill from API then add real-time ones
  const [liveAlerts, setLiveAlerts] = useState([])
  // Toast notification for new real-time alerts
  const [toast, setToast] = useState(null)

  // When dashboard data loads, populate alerts
  useEffect(() => {
    if (data?.recentAlerts) setLiveAlerts(data.recentAlerts)
  }, [data])

  // When a new real-time alert arrives via Socket.io
  useEffect(() => {
    if (alerts.length === 0) return
    const latest = alerts[0]
    setLiveAlerts(prev => [latest, ...prev])
    setToast(latest)
    setTimeout(() => setToast(null), 4000)
    refetch()
    }, [alerts])

  // Today's date formatted nicely e.g. "Monday, 3 June 2025"
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  if (loading) return <Layout><LoadingSpinner text="Loading your dashboard..." /></Layout>
  if (error)   return <Layout><ErrorMessage message={error} /></Layout>

  const {
    totalStudents   = 0,
    attendanceRate  = 0,
    unreadAlerts    = 0,
    pendingTasks    = 0,
    burnoutScore    = 0,
    todaySchedule   = [],
    classes         = [],
  } = data || {}

  return (
    <Layout>

      {/* ── Real-time Alert Toast ─────────────────────────────────── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-white border border-[#E5E7EB] rounded-2xl shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A2E]">New Alert</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-[#9CA3AF] hover:text-[#1A1A2E] ml-auto">
            ✕
          </button>
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-3xl font-bold text-[#1A1A2E]">
              Good morning, {user?.name?.split(' ')[0]} 👋
            </h1>
          </div>
          <p className="text-[#6B7280]">{todayFormatted}</p>
        </div>

        {/* Socket.io connection status indicator */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${
          connected ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {connected
            ? <><Wifi className="w-3 h-3" /> Live</>
            : <><WifiOff className="w-3 h-3" /> Offline</>
          }
        </div>
      </div>

      {/* ── Stat Cards Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle={`Across ${classes.length} class${classes.length !== 1 ? 'es' : ''}`}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          subtitle="Past 14 days"
          icon={ClipboardCheck}
          color={attendanceRate >= 80 ? 'green' : attendanceRate >= 60 ? 'yellow' : 'red'}
        />
        <StatCard
          title="Active Alerts"
          value={unreadAlerts}
          subtitle="Needs attention"
          icon={AlertTriangle}
          color={unreadAlerts > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          subtitle="Reports to review"
          icon={Calendar}
          color="blue"
        />
      </div>

      {/* ── Main Grid: Schedule + Burnout + Alerts ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Today's Schedule (takes 2 columns) ───────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">

            {/* Card Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <div>
                <h2 className="font-display font-bold text-lg text-[#1A1A2E]">Today's Schedule</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {todaySchedule.length > 0
                    ? `${todaySchedule.length} periods today`
                    : 'No classes scheduled today'}
                </p>
              </div>
              <button
                onClick={() => navigate('/timetable')}
                className="flex items-center gap-1 text-xs font-medium text-[#7C3AED] hover:underline"
              >
                Full timetable <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Schedule list */}
            <div className="p-4">
              {todaySchedule.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-[#6B7280] text-sm">No classes today. Enjoy your day!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaySchedule.map((slot, i) => (
                    <ScheduleCard key={slot.id} slot={slot} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── My Classes Quick-access ──────────────────────── */}
          {classes.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="font-display font-bold text-lg text-[#1A1A2E]">My Classes</h2>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {classes.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => navigate(`/attendance?classId=${cls.id}`)}
                    className="flex flex-col items-start p-4 rounded-xl border border-[#E5E7EB] hover:border-[#7C3AED] hover:bg-[#F5F3FF] transition-all duration-150 text-left group"
                  >
                    <div className="w-10 h-10 bg-[#EDE9FE] rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#DDD6FE] transition-colors">
                      <Users className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                    <p className="font-semibold text-sm text-[#1A1A2E]">{cls.name}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {cls.students?.length || 0} students
                    </p>
                    <p className="text-xs text-[#7C3AED] mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Take attendance →
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Burnout + Alerts ───────────────────── */}
        <div className="space-y-6">

          {/* Burnout Widget */}
          <BurnoutWidget score={burnoutScore} />

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-[#1A1A2E]">
                  Recent Alerts
                </h2>
                {/* Unread badge */}
                {unreadAlerts > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadAlerts > 9 ? '9+' : unreadAlerts}
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs font-medium text-[#7C3AED] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              {liveAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-xs text-[#6B7280]">No alerts right now.</p>
                </div>
              ) : (
                // Show only the 4 most recent
                liveAlerts.slice(0, 4).map(alert => (
                  <AlertPreviewCard key={alert.id} alert={alert} />
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-display font-bold text-base text-[#1A1A2E]">Quick Actions</h2>
            </div>
            <div className="p-3 space-y-2">
              {[
                { label: 'Mark Attendance',    emoji: '✅', path: '/attendance'  },
                { label: 'Enter Grades',        emoji: '📝', path: '/grades'      },
                { label: 'Generate AI Report',  emoji: '🤖', path: '/reports'     },
                { label: 'View Timetable',      emoji: '📅', path: '/timetable'   },
              ].map(action => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F3FF] transition-colors text-left group"
                >
                  <span className="text-lg">{action.emoji}</span>
                  <span className="text-sm font-medium text-[#1A1A2E] group-hover:text-[#7C3AED] transition-colors">
                    {action.label}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#9CA3AF] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}