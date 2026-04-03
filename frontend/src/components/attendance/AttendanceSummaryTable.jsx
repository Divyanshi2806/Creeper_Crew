// AttendanceSummaryTable.jsx — Shows 30-day attendance % per student
// Used in the Summary tab of the attendance page

import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'  // ← ADDED

export default function AttendanceSummaryTable({ summary }) {
  const navigate = useNavigate()  // ← ADDED

  if (!summary || summary.length === 0) {
    return <p className="text-center text-[#6B7280] py-8 text-sm">No data available.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            {['Roll No.', 'Student Name', 'Present', 'Late', 'Absent', 'Attendance %', 'Status'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F3F4F6]">
          {summary.map(student => (
            <tr key={student.id} className={`hover:bg-[#FAFAFA] transition-colors ${student.isAtRisk ? 'bg-red-50/50' : ''}`}>

              {/* Roll number */}
              <td className="px-4 py-3 text-xs text-[#6B7280] font-mono">
                {student.rollNumber}
              </td>

              {/* Name — now clickable, navigates to student profile */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
                    <span className="text-[#7C3AED] text-xs font-bold">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  {/* ↓ CHANGED: was a plain <span>, now clickable */}
                  <span
                    className="font-medium text-[#1A1A2E] cursor-pointer hover:text-[#7C3AED] transition-colors"
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    {student.name}
                  </span>
                </div>
              </td>

              {/* Present count */}
              <td className="px-4 py-3 text-emerald-600 font-medium">{student.present}</td>

              {/* Late count */}
              <td className="px-4 py-3 text-amber-600 font-medium">{student.late}</td>

              {/* Absent count */}
              <td className="px-4 py-3 text-red-500 font-medium">{student.absent}</td>

              {/* Percentage bar */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${student.percentage}%`,
                        backgroundColor:
                          student.percentage >= 75 ? '#10B981' :
                          student.percentage >= 60 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </div>
                  <span className={`font-semibold text-xs ${
                    student.percentage >= 75 ? 'text-emerald-600' :
                    student.percentage >= 60 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    {student.percentage}%
                  </span>
                </div>
              </td>

              {/* Status badge */}
              <td className="px-4 py-3">
                {student.isAtRisk ? (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">At Risk</span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600">✓ Good</span>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}