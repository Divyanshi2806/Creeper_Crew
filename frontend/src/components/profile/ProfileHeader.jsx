// ProfileHeader.jsx — Big top card with avatar, name, class and key stats

import { Mail, Hash, Users } from 'lucide-react'

export default function ProfileHeader({ student, attendancePercent }) {
  const attendanceColor =
    attendancePercent >= 75 ? '#10B981' :
    attendancePercent >= 60 ? '#F59E0B' : '#EF4444'

  // Calculate overall average grade across every subject
  const allGrades = Object.values(student.gradesBySubject || {}).flat()
  const avgGrade  = allGrades.length > 0
    ? Math.round(allGrades.reduce((sum, g) => sum + g.percentage, 0) / allGrades.length)
    : 0

  const gradeColor =
    avgGrade >= 75 ? '#10B981' :
    avgGrade >= 40 ? '#F59E0B' : '#EF4444'

  const openAlerts = (student.alerts || []).filter(a => !a.isRead).length

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      {/* Purple banner */}
      <div className="h-24 bg-liner-to-r from-[#7C3AED] to-[#5B21B6] relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full" />
        <div className="absolute right-20 top-4  w-16 h-16 bg-white/10 rounded-full" />
      </div>

      <div className="px-6 pb-6">
        {/* Avatar + attendance badge row */}
        <div className="flex items-end justify-between -mt-10 mb-4">
          {/* Avatar overlaps the banner */}
          <div className="w-20 h-20 rounded-2xl bg-[#7C3AED] border-4 border-white flex items-center justify-center shadow-lg shrink-0">
            <span className="text-white text-3xl font-display font-bold">
              {student.name.charAt(0)}
            </span>
          </div>

          {/* Attendance % pill */}
          <div
            className="flex flex-col items-center px-4 py-2 rounded-xl border-2"
            style={{ borderColor: attendanceColor + '50', backgroundColor: attendanceColor + '12' }}
          >
            <span className="text-2xl font-display font-bold" style={{ color: attendanceColor }}>
              {attendancePercent}%
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: attendanceColor }}>
              Attendance
            </span>
          </div>
        </div>

        {/* Name */}
        <h1 className="font-display text-2xl font-bold text-[#1A1A2E] mb-1">
          {student.name}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Users className="w-3.5 h-3.5" />
            {student.class?.name}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Hash className="w-3.5 h-3.5" />
            Roll No: {student.rollNumber}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Mail className="w-3.5 h-3.5" />
            {student.parentEmail}
          </div>
        </div>

        {/* Quick stat pills */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Avg Grade',   value: `${avgGrade}%`, sub: avgGrade >= 40 ? 'Passing' : 'Failing', color: gradeColor      },
            { label: 'Subjects',    value: Object.keys(student.gradesBySubject || {}).length, sub: 'Enrolled', color: '#7C3AED' },
            { label: 'Open Alerts', value: openAlerts, sub: 'Unread', color: openAlerts > 0 ? '#EF4444' : '#10B981'            },
          ].map(stat => (
            <div key={stat.label} className="bg-[#FAFAFA] rounded-xl p-3 text-center border border-[#E5E7EB]">
              <p className="text-2xl font-display font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">{stat.label}</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: stat.color }}>
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}