// AttendancePage.jsx — Full attendance marking + summary page

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import StudentAttendanceRow from '@/components/attendance/StudentAttendanceRow'
import VoiceAttendancePanel from '@/components/attendance/VoiceAttendancePanel'
import AttendanceSummaryTable from '@/components/attendance/AttendanceSummaryTable'
import { useAttendance } from '@/hooks/useAttendance'
import { useAttendanceSummary } from '@/hooks/useAttendanceSummary'
import { useVoiceAttendance } from '@/hooks/useVoiceAttendance'
import api from '@/utils/api'
import {
  ClipboardCheck, CheckCheck, Loader2,
  Users, CalendarDays, ChevronDown
} from 'lucide-react'

export default function AttendancePage() {
  // Read classId from URL query param e.g. /attendance?classId=1
  const [searchParams] = useSearchParams()
  const urlClassId = searchParams.get('classId')

  // State
  const [classes,         setClasses]         = useState([])    // teacher's classes
  const [selectedClassId, setSelectedClassId] = useState(urlClassId || '')
  const [selectedDate,    setSelectedDate]    = useState(
    new Date().toISOString().split('T')[0]  // today's date in YYYY-MM-DD format
  )
  const [activeTab, setActiveTab] = useState('mark')  // 'mark' | 'summary'
  const [voiceHighlight, setVoiceHighlight] = useState(null) // student id matched by voice

  // Load teacher's classes for the dropdown
  useEffect(() => {
    api.get('/students', { params: { classId: undefined } })
      .catch(() => {})

    // Fetch classes via dashboard endpoint
    api.get('/teachers/dashboard').then(res => {
      const cls = res.data.classes || []
      setClasses(cls)
      // If no class selected yet, default to first
      if (!selectedClassId && cls.length > 0) {
        setSelectedClassId(String(cls[0].id))
      }
    }).catch(() => {})
  }, [])

  // Attendance data hook
  const {
    students, loading, saving, error, saved,
    updateStatus, markAllPresent, saveAttendance
  } = useAttendance(selectedClassId, selectedDate)

  // Summary data hook
  const {
    summary, loading: summaryLoading, error: summaryError
  } = useAttendanceSummary(activeTab === 'summary' ? selectedClassId : null)

  // Voice attendance hook
  const {
    listening, transcript, matchedName, error: voiceError,
    isSupported, startListening, stopListening
  } = useVoiceAttendance(students, (studentId, status) => {
    updateStatus(studentId, status)
    // Highlight the matched student row for 2 seconds
    setVoiceHighlight(studentId)
    setTimeout(() => setVoiceHighlight(null), 2000)
  })

  // Count current statuses for the summary bar
  const counts = students.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1
      return acc
    },
    { present: 0, absent: 0, late: 0 }
  )

  const selectedClass = classes.find(c => String(c.id) === String(selectedClassId))

  return (
    <Layout>
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">Attendance</h1>
        </div>
        <p className="text-[#6B7280] text-sm ml-12">
          Mark and track student attendance for your classes
        </p>
      </div>

      {/* ── Controls: Class + Date + Tabs ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

          {/* Class selector */}
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
              Class
            </label>
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full appearance-none bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#1A1A2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED] pr-10 cursor-pointer"
              >
                <option value="">Select a class...</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
            </div>
          </div>

          {/* Date picker */}
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
              Date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]} // can't mark future dates
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1A1A2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
          </div>

          {/* Tab switcher */}
          <div className="shrink-0 self-end">
            <div className="flex gap-1 p-1 bg-[#F3F4F6] rounded-xl">
              {[
                { key: 'mark',    label: '📋 Mark'    },
                { key: 'summary', label: '📊 Summary' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    activeTab === tab.key
                      ? 'bg-white text-[#7C3AED] shadow-sm'
                      : 'text-[#6B7280] hover:text-[#1A1A2E]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {/* ── MARK ATTENDANCE TAB ─────────────────────────────────── */}
      {activeTab === 'mark' && (
        <>
          {!selectedClassId ? (
            // No class selected yet
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 text-center">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-[#6B7280]">Select a class above to start marking attendance.</p>
            </div>
          ) : loading ? (
            <LoadingSpinner text="Loading students..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Left: Student List ─────────────────────────── */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">

                  {/* List Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
                    <div>
                      <h2 className="font-display font-bold text-base text-[#1A1A2E]">
                        {selectedClass?.name || 'Students'}
                      </h2>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {students.length} students · {selectedDate}
                      </p>
                    </div>

                    {/* Mark all present button */}
                    <button
                      onClick={markAllPresent}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      All Present
                    </button>
                  </div>

                  {/* Status summary bar */}
                  {students.length > 0 && (
                    <div className="flex border-b border-[#E5E7EB]">
                      {[
                        { label: 'Present', count: counts.present, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Absent',  count: counts.absent,  color: 'text-red-500',     bg: 'bg-red-50'     },
                        { label: 'Late',    count: counts.late,    color: 'text-amber-600',   bg: 'bg-amber-50'   },
                      ].map(item => (
                        <div key={item.label} className={`flex-1 flex flex-col items-center py-2.5 ${item.bg}`}>
                          <p className={`text-xl font-display font-bold ${item.color}`}>
                            {item.count}
                          </p>
                          <p className="text-xs text-[#6B7280]">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Student rows */}
                  <div className="p-4 space-y-2 max-h-125 overflow-y-auto">
                    {students.length === 0 ? (
                      <div className="text-center py-10">
                        <Users className="w-10 h-10 text-[#E5E7EB] mx-auto mb-2" />
                        <p className="text-[#6B7280] text-sm">No students in this class.</p>
                      </div>
                    ) : (
                      students.map(student => (
                        <StudentAttendanceRow
                          key={student.id}
                          student={student}
                          onStatusChange={updateStatus}
                          isHighlighted={voiceHighlight === student.id}
                        />
                      ))
                    )}
                  </div>

                  {/* Save Button */}
                  {students.length > 0 && (
                    <div className="px-5 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
                      {/* Success message */}
                      {saved && (
                        <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                          ✅ Attendance saved successfully!
                        </p>
                      )}
                      {!saved && <div />}

                      <button
                        onClick={saveAttendance}
                        disabled={saving || students.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#7C3AED] hover:bg-[#5B21B6] disabled:bg-[#C4B5FD] text-white font-semibold rounded-xl transition-all duration-200 text-sm"
                      >
                        {saving ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : (
                          <><ClipboardCheck className="w-4 h-4" /> Save Attendance</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right: Voice Panel + Tips ──────────────────── */}
              <div className="space-y-4">
                <VoiceAttendancePanel
                  listening={listening}
                  transcript={transcript}
                  matchedName={matchedName}
                  error={voiceError}
                  isSupported={isSupported}
                  onStart={startListening}
                  onStop={stopListening}
                />

                {/* Attendance key */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
                    Legend
                  </p>
                  <div className="space-y-2">
                    {[
                      { color: 'bg-emerald-500', label: 'Present — Student attended class' },
                      { color: 'bg-amber-500',   label: 'Late — Arrived after start time' },
                      { color: 'bg-red-500',     label: 'Absent — Did not attend class'   },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`} />
                        <p className="text-xs text-[#6B7280]">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                    <p className="text-xs text-[#6B7280]">
                      💡 Students below <strong>75%</strong> attendance are automatically flagged with an alert.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── SUMMARY TAB ─────────────────────────────────────────── */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="font-display font-bold text-lg text-[#1A1A2E]">
              30-Day Attendance Summary
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {selectedClass?.name} · Past 30 school days
            </p>
          </div>

          {!selectedClassId ? (
            <div className="p-12 text-center text-[#6B7280]">
              Select a class to view the summary.
            </div>
          ) : summaryLoading ? (
            <LoadingSpinner text="Loading summary..." />
          ) : summaryError ? (
            <div className="p-6"><ErrorMessage message={summaryError} /></div>
          ) : (
            <AttendanceSummaryTable summary={summary} />
          )}
        </div>
      )}
    </Layout>
  )
}