// AlertPreviewCard.jsx — Compact alert card shown on the dashboard

import { AlertTriangle, TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AlertPreviewCard({ alert }) {
  const navigate = useNavigate()

  // Icon and colours differ by alert type
  const isAttendance = alert.type === 'attendance'

  return (
    <div
      onClick={() => navigate('/alerts')}
      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 hover:shadow-sm ${
        isAttendance
          ? 'bg-amber-50 border-amber-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isAttendance ? 'bg-amber-100' : 'bg-red-100'
      }`}>
        {isAttendance
          ? <AlertTriangle className="w-4 h-4 text-amber-600" />
          : <TrendingDown className="w-4 h-4 text-red-600" />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#1A1A2E] truncate">
          {alert.student?.name}
        </p>
        <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">
          {alert.message}
        </p>
      </div>

      {/* Unread dot */}
      {!alert.isRead && (
        <div className="w-2 h-2 bg-[#7C3AED] rounded-full shrink-0 mt-1" />
      )}
    </div>
  )
}