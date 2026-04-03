// AlertHistory.jsx — Lists all alerts ever raised for this student

import { AlertTriangle, TrendingDown, CheckCircle } from 'lucide-react'

export default function AlertHistory({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center py-10">
        <CheckCircle className="w-10 h-10 text-emerald-300 mb-2" />
        <p className="text-sm text-[#6B7280]">No alerts raised for this student.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const isAttendance = alert.type === 'attendance'
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
              alert.isRead
                ? 'bg-[#FAFAFA] border-[#E5E7EB]'
                : isAttendance
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-red-50 border-red-200'
            }`}
          >
            {/* Icon */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              alert.isRead    ? 'bg-[#F3F4F6]' :
              isAttendance    ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              {isAttendance
                ? <AlertTriangle className={`w-4 h-4 ${alert.isRead ? 'text-[#9CA3AF]' : 'text-amber-600'}`} />
                : <TrendingDown  className={`w-4 h-4 ${alert.isRead ? 'text-[#9CA3AF]' : 'text-red-500'}`}   />
              }
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  alert.isRead ? 'text-[#9CA3AF]' :
                  isAttendance ? 'text-amber-700' : 'text-red-600'
                }`}>
                  {isAttendance ? 'Attendance Alert' : 'Grade Drop Alert'}
                </span>
                {/* Unread dot */}
                {!alert.isRead && (
                  <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full shrink-0" />
                )}
              </div>
              <p className="text-sm text-[#374151]">{alert.message}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                {new Date(alert.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}