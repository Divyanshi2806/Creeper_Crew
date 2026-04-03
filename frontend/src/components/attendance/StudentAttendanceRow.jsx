// StudentAttendanceRow.jsx — One row in the attendance table
// Shows student name + roll number + 3 status buttons

import { Check, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

// The three possible statuses with their styles
const STATUS_CONFIG = {
  present: {
    label: 'Present',
    icon: Check,
    active:   'bg-emerald-500 text-white border-emerald-500',
    inactive: 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50',
  },
  absent: {
    label: 'Absent',
    icon: X,
    active:   'bg-red-500 text-white border-red-500',
    inactive: 'bg-white text-red-500 border-red-200 hover:bg-red-50',
  },
  late: {
    label: 'Late',
    icon: Clock,
    active:   'bg-amber-500 text-white border-amber-500',
    inactive: 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50',
  },
}

export default function StudentAttendanceRow({ student, onStatusChange, isHighlighted }) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200',
      isHighlighted
        ? 'bg-[#F5F3FF] border-[#7C3AED] shadow-sm'   // highlighted after voice match
        : 'bg-white border-[#E5E7EB] hover:border-[#DDD6FE]'
    )}>

      {/* ── Avatar with initials ─────────────────── */}
      <div className="w-9 h-9 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
        <span className="text-[#7C3AED] text-sm font-bold">
          {student.name.charAt(0)}
        </span>
      </div>

      {/* ── Name + roll number ───────────────────── */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1A2E] truncate">{student.name}</p>
        <p className="text-xs text-[#6B7280]">{student.rollNumber}</p>
      </div>

      {/* ── Status Buttons ───────────────────────── */}
      <div className="flex gap-1.5 shrink-0">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon
          const isActive = student.status === status

          return (
            <button
              key={status}
              onClick={() => onStatusChange(student.id, status)}
              title={config.label}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150',
                isActive ? config.active : config.inactive
              )}
            >
              <Icon className="w-3 h-3" />
              {/* Show label only on larger screens */}
              <span className="hidden sm:inline">{config.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}