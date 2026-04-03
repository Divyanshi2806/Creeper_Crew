// Sidebar.jsx — Left navigation for all pages
// Shows different links based on whether user is teacher or admin

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Users, ClipboardCheck, BarChart2,
  FileText, Bell, Calendar, Settings, LogOut,
  GraduationCap, Shield, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// Navigation links for teachers
const teacherLinks = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/attendance',  icon: ClipboardCheck,  label: 'Attendance'  },
  { to: '/grades',      icon: BarChart2,        label: 'Grades'      },
  { to: '/reports',     icon: FileText,         label: 'AI Reports'  },
  { to: '/alerts',      icon: Bell,             label: 'Alerts'      },
  { to: '/timetable',   icon: Calendar,         label: 'Timetable'   },
]

// Navigation links for admins
const adminLinks = [
  { to: '/admin',           icon: Shield,          label: 'Dashboard'   },
  { to: '/admin/students',  icon: Users,           label: 'Students'    },
  { to: '/admin/teachers',  icon: GraduationCap,   label: 'Teachers'    },
  { to: '/timetable',       icon: Calendar,        label: 'Timetable'   },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = user?.role === 'admin' ? adminLinks : teacherLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // The actual sidebar content (shared between desktop and mobile)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* ── Logo & Brand ─────────────────────────── */}
      <div className="px-6 py-5 border-b border-[#EDE9FE]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-[#1A1A2E] text-lg leading-none">EduEase</p>
            <p className="text-[10px] text-[#7C3AED] font-medium uppercase tracking-widest mt-0.5">
              {user?.role === 'admin' ? 'Admin Panel' : 'Teacher Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* ── User Info Card ───────────────────────── */}
      <div className="px-4 py-4 border-b border-[#EDE9FE]">
        <div className="flex items-center gap-3 bg-[#F5F3FF] rounded-xl p-3">
          {/* Avatar with initials */}
          <div className="w-9 h-9 rounded-full bg-[#7C3AED] flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1A1A2E] truncate">{user?.name}</p>
            <p className="text-xs text-[#6B7280] truncate">
              {user?.role === 'admin' ? 'Administrator' : user?.subject}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation Links ─────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/admin'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#7C3AED] text-white shadow-sm shadow-purple-200'
                  : 'text-[#6B7280] hover:bg-[#F5F3FF] hover:text-[#7C3AED]'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Logout Button ────────────────────────── */}
      <div className="px-3 py-4 border-t border-[#EDE9FE]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#EF4444] hover:bg-red-50 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile Hamburger Button ──────────────── */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* ── Mobile Overlay ───────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar (slide in) ────────────── */}
      <div className={cn(
        'lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 border-r border-[#EDE9FE] transform transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </div>

      {/* ── Desktop Sidebar (always visible) ─────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#EDE9FE] h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>
    </>
  )
}