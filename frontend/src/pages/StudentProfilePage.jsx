// StudentProfilePage.jsx — Complete individual student view
// Reachable from: class cards, admin student list, alert cards

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import ProfileHeader     from '@/components/profile/ProfileHeader'
import AttendanceCalendar from '@/components/profile/AttendanceCalendar'
import SubjectGradeChart  from '@/components/profile/SubjectGradeChart'
import AISummaryCard      from '@/components/profile/AISummaryCard'
import AlertHistory       from '@/components/profile/AlertHistory'
import { useStudentProfile } from '@/hooks/useStudentProfile'
import { ArrowLeft, FileText } from 'lucide-react'

// Tab definitions
const TABS = [
  { key: 'overview',    label: '📊 Overview'    },
  { key: 'attendance',  label: '📅 Attendance'  },
  { key: 'grades',      label: '📝 Grades'      },
  { key: 'alerts',      label: '🔔 Alerts'      },
]

export default function StudentProfilePage() {
  const { id }       = useParams()          // student ID from URL /students/:id
  const navigate     = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { student, loading, error } = useStudentProfile(id)

  // ── Loading state ────────────────────────────────────────
  if (loading) return (
    <Layout>
      <LoadingSpinner text="Loading student profile..." />
    </Layout>
  )

  // ── Error state ──────────────────────────────────────────
  if (error) return (
    <Layout>
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1A1A2E] mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <ErrorMessage message={error} />
      </div>
    </Layout>
  )

  if (!student) return null

  // ── Compute attendance percentage ────────────────────────
  const totalDays   = student.attendance?.length || 0
  const presentDays = student.attendance?.filter(a => a.status === 'present').length || 0
  const lateDays    = student.attendance?.filter(a => a.status === 'late').length    || 0
  const attendancePercent = totalDays > 0
    ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100)
    : 0

  return (
    <Layout>

      {/* ── Back button ────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1A1A2E] mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* ── Profile Header Card ────────────────────────────── */}
      <div className="mb-6">
        <ProfileHeader student={student} attendancePercent={attendancePercent} />
      </div>

      {/* ── Tab Bar ────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-white border border-[#E5E7EB] rounded-2xl mb-6 overflow-x-auto">
        {TABS.map(tab => {
          // Show unread count badge on Alerts tab
          const unreadCount = tab.key === 'alerts'
            ? (student.alerts || []).filter(a => !a.isRead).length
            : 0

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-[#F9FAFB]'
              }`}
            >
              {tab.label}
              {unreadCount > 0 && (
                <span className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                  activeTab === tab.key ? 'bg-white text-[#7C3AED]' : 'bg-red-500 text-white'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* TAB: OVERVIEW                                        */}
      {/* ════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* AI Summary */}
          <div className="lg:col-span-2">
            <AISummaryCard student={student} />
          </div>

          {/* Attendance snapshot */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <h2 className="font-display font-bold text-base text-[#1A1A2E] mb-1">
              Attendance Snapshot
            </h2>
            <p className="text-xs text-[#6B7280] mb-4">Past 30 days</p>

            {/* Stat row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Present', value: presentDays, color: '#10B981' },
                { label: 'Late',    value: lateDays,    color: '#F59E0B' },
                { label: 'Absent',  value: student.attendance?.filter(a => a.status === 'absent').length || 0, color: '#EF4444' },
              ].map(item => (
                <div key={item.label} className="text-center p-3 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB]">
                  <p className="text-xl font-display font-bold" style={{ color: item.color }}>
                    {item.value}
                  </p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>

            <AttendanceCalendar attendance={student.attendance || []} />
          </div>

          {/* Grade overview — show first 2 subjects */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <h2 className="font-display font-bold text-base text-[#1A1A2E] mb-1">
              Grade Overview
            </h2>
            <p className="text-xs text-[#6B7280] mb-4">Top 2 subjects</p>

            <div className="space-y-4">
              {Object.entries(student.gradesBySubject || {})
                .slice(0, 2)
                .map(([subject, grades]) => (
                  <SubjectGradeChart key={subject} subject={subject} grades={grades} />
                ))
              }

              {Object.keys(student.gradesBySubject || {}).length > 2 && (
                <button
                  onClick={() => setActiveTab('grades')}
                  className="w-full py-2 text-sm font-medium text-[#7C3AED] hover:underline"
                >
                  View all subjects →
                </button>
              )}
            </div>
          </div>

          {/* Quick generate full report button */}
          <div className="lg:col-span-2 bg-[#F5F3FF] rounded-2xl border border-[#DDD6FE] p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[#1A1A2E]">Need a full progress report?</p>
              <p className="text-sm text-[#6B7280] mt-0.5">
                Generate a detailed parent-ready report with one click from the AI Reports page.
              </p>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-semibold text-sm rounded-xl transition-all duration-200 whitespace-nowrap shrink-0"
            >
              <FileText className="w-4 h-4" />
              Full Report
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/* TAB: ATTENDANCE                                      */}
      {/* ════════════════════════════════════════════════════ */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <h2 className="font-display font-bold text-lg text-[#1A1A2E] mb-1">
            Attendance History
          </h2>
          <p className="text-xs text-[#6B7280] mb-6">
            Past 30 days · {totalDays} school days recorded
          </p>

          {/* Big stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Overall',  value: `${attendancePercent}%`, color: attendancePercent >= 75 ? '#10B981' : attendancePercent >= 60 ? '#F59E0B' : '#EF4444' },
              { label: 'Present',  value: presentDays,             color: '#10B981' },
              { label: 'Late',     value: lateDays,                color: '#F59E0B' },
              { label: 'Absent',   value: student.attendance?.filter(a => a.status === 'absent').length || 0, color: '#EF4444' },
            ].map(item => (
              <div key={item.label} className="text-center p-4 bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB]">
                <p className="text-3xl font-display font-bold" style={{ color: item.color }}>
                  {item.value}
                </p>
                <p className="text-xs text-[#6B7280] mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Risk warning */}
          {attendancePercent < 75 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red-700">Attendance Below Threshold</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {student.name.split(' ')[0]} has {attendancePercent}% attendance.
                  The minimum required is 75%. Parents have been automatically notified.
                </p>
              </div>
            </div>
          )}

          {/* Full calendar */}
          <AttendanceCalendar attendance={student.attendance || []} />

          {/* Attendance records table */}
          {student.attendance?.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-sm text-[#1A1A2E] mb-3">Recent Records</h3>
              <div className="divide-y divide-[#F3F4F6]">
                {student.attendance.slice(0, 14).map(record => {
                  const statusColors = {
                    present: 'bg-emerald-100 text-emerald-700',
                    absent:  'bg-red-100 text-red-600',
                    late:    'bg-amber-100 text-amber-700',
                  }
                  return (
                    <div key={record.id} className="flex items-center justify-between py-2.5 px-1">
                      <span className="text-sm text-[#374151]">
                        {new Date(record.date).toLocaleDateString('en-IN', {
                          weekday: 'short', day: 'numeric', month: 'short'
                        })}
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[record.status]}`}>
                        {record.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/* TAB: GRADES                                          */}
      {/* ════════════════════════════════════════════════════ */}
      {activeTab === 'grades' && (
        <div className="space-y-6">

          {/* Overall grade summary bar */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <h2 className="font-display font-bold text-lg text-[#1A1A2E] mb-4">
              Subject Performance
            </h2>

            <div className="space-y-4">
              {Object.entries(student.gradesBySubject || {}).map(([subject, grades]) => {
                const avg = grades.length > 0
                  ? Math.round(grades.reduce((s, g) => s + g.percentage, 0) / grades.length)
                  : 0
                const barColor =
                  avg >= 75 ? '#10B981' :
                  avg >= 40 ? '#F59E0B' : '#EF4444'

                return (
                  <div key={subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#1A1A2E]">{subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: barColor }}>{avg}%</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ color: barColor, backgroundColor: barColor + '18' }}
                        >
                          {avg >= 40 ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${avg}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Individual subject line charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(student.gradesBySubject || {}).map(([subject, grades]) => (
              <SubjectGradeChart key={subject} subject={subject} grades={grades} />
            ))}
          </div>

          {/* Detailed marks table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-display font-bold text-base text-[#1A1A2E]">All Exam Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
                    {['Subject', 'Topic', 'Marks', 'Max', 'Percentage', 'Result'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {student.grades?.map(grade => {
                    const pct    = Math.round((grade.marks / grade.maxMarks) * 100)
                    const passed = pct >= 40
                    return (
                      <tr key={grade.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-5 py-3 font-medium text-[#1A1A2E]">{grade.subject}</td>
                        <td className="px-5 py-3 text-[#6B7280]">{grade.topic}</td>
                        <td className="px-5 py-3 font-semibold text-[#1A1A2E]">{grade.marks}</td>
                        <td className="px-5 py-3 text-[#6B7280]">{grade.maxMarks}</td>
                        <td className="px-5 py-3">
                          <span className={`font-bold ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                            {pct}%
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                          }`}>
                            {passed ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/* TAB: ALERTS                                          */}
      {/* ════════════════════════════════════════════════════ */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-lg text-[#1A1A2E]">Alert History</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                All intervention alerts raised for {student.name}
              </p>
            </div>
            {/* Alert count pill */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              (student.alerts || []).filter(a => !a.isRead).length > 0
                ? 'bg-red-100 text-red-600'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {(student.alerts || []).filter(a => !a.isRead).length} unread
            </div>
          </div>

          <AlertHistory alerts={student.alerts || []} />
        </div>
      )}

    </Layout>
  )
}