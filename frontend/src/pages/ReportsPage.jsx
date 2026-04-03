// ReportsPage.jsx — AI Report Generator using Groq (free)
// Teacher selects student → adds notes → generates report → approves → emails parent

import { useState } from 'react'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import StudentSelector from '@/components/reports/StudentSelector'
import ReportPreview   from '@/components/reports/ReportPreview'
import { useReports }  from '@/hooks/useReports'
import {
  Sparkles, Loader2, FileText,
  ChevronRight, Info
} from 'lucide-react'

export default function ReportsPage() {
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [teacherNotes,      setTeacherNotes]      = useState('')

  const {
    students, classes, loadingStudents,
    report, reportStudent, generating, generateError,
    sending, sendSuccess, sendError,
    generateReport, sendReport, clearReport,
  } = useReports()

  // When teacher clicks "Generate Report"
  const handleGenerate = () => {
    generateReport(selectedStudentId, teacherNotes)
  }

  // When teacher changes student — clear old report
  const handleSelectStudent = (id) => {
    setSelectedStudentId(id)
    clearReport()
    setTeacherNotes('')
  }

  return (
    <Layout>

      {/* ── Page Header ────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">AI Report Generator</h1>
        </div>
        <p className="text-[#6B7280] text-sm ml-12">
          Generate parent-ready progress reports in seconds using Groq AI
        </p>
      </div>

      {/* ── How It Works Banner ────────────────────────────── */}
      <div className="bg-linear-to-r from-[#F5F3FF] to-[#EDE9FE] rounded-2xl border border-[#DDD6FE] p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[#7C3AED] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#1A1A2E] mb-2">How it works</p>
            <div className="flex flex-wrap gap-2 text-xs text-[#6B7280]">
              {[
                '1️⃣  Select a student',
                '2️⃣  Add optional teacher notes',
                '3️⃣  Click Generate Report',
                '4️⃣  Review the AI output',
                '5️⃣  Click Approve & Send to email the parent',
              ].map(step => (
                <span key={step} className="flex items-center gap-1">
                  {step}
                  {step !== '5️⃣  Click Approve & Send to email the parent' && (
                    <ChevronRight className="w-3 h-3 text-[#C4B5FD]" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT: Input Panel ──────────────────────────── */}
        <div className="space-y-5">

          {/* Student selector */}
          <StudentSelector
            students={students}
            classes={classes}
            selectedStudentId={selectedStudentId}
            onSelect={handleSelectStudent}
            loadingStudents={loadingStudents}
          />

          {/* Teacher notes input */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <label className="block font-display font-bold text-base text-[#1A1A2E] mb-1">
              Teacher Notes
              <span className="text-xs font-sans font-normal text-[#9CA3AF] ml-2">
                (optional)
              </span>
            </label>
            <p className="text-xs text-[#6B7280] mb-3">
              Add specific observations, concerns, or praise to personalise the report.
            </p>
            <textarea
              value={teacherNotes}
              onChange={e => setTeacherNotes(e.target.value)}
              placeholder="e.g. Rohan has shown great improvement in class participation this month but needs to revise his Mathematics fundamentals before the upcoming exam..."
              rows={5}
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] resize-none focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all leading-relaxed"
            />
            <p className="text-xs text-[#9CA3AF] mt-1.5 text-right">
              {teacherNotes.length} / 500 characters
            </p>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!selectedStudentId || generating || loadingStudents}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#7C3AED] hover:bg-[#5B21B6] disabled:bg-[#C4B5FD] disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-sm shadow-purple-200"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Groq AI is writing the report...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Report with AI
              </>
            )}
          </button>

          {/* Generate error */}
          {generateError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium mb-1">Generation Failed</p>
              <p className="text-xs text-red-500">{generateError}</p>
            </div>
          )}

          {/* Groq branding note */}
          <div className="flex items-center gap-2 justify-center">
            <div className="w-5 h-5 bg-[#F97316] rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-black">G</span>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Powered by <span className="font-semibold text-[#6B7280]">Groq</span>
              {' '}· Llama 3.3 70B · Free tier
            </p>
          </div>
        </div>

        {/* ── RIGHT: Output Panel ────────────────────────── */}
        <div>
          {/* Empty state — nothing generated yet */}
          {!report && !generating && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] border-dashed flex flex-col items-center justify-center p-12 h-full min-h-100 text-center">
              <div className="w-16 h-16 bg-[#F5F3FF] rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[#C4B5FD]" />
              </div>
              <p className="font-semibold text-[#1A1A2E] mb-1">No report yet</p>
              <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed">
                Select a student and click <strong>"Generate Report"</strong> to create
                an AI-powered progress report in seconds.
              </p>

              {/* Example preview badge */}
              <div className="mt-6 px-4 py-2 bg-[#F5F3FF] rounded-xl border border-[#DDD6FE]">
                <p className="text-xs text-[#7C3AED] font-medium">
                  ⚡ Reports generate in under 3 seconds
                </p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {generating && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] flex flex-col items-center justify-center p-12 h-full min-h-100">
              <div className="flex gap-2 mb-4">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-[#7C3AED] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="font-semibold text-[#1A1A2E] mb-1">Groq AI is writing...</p>
              <p className="text-sm text-[#6B7280]">
                Analysing attendance, grades, and teacher notes
              </p>

              {/* Animated progress steps */}
              <div className="mt-6 space-y-2 w-full max-w-xs">
                {[
                  'Loading student data...',
                  'Calculating attendance...',
                  'Analysing grade trends...',
                  'Writing the report...',
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                    <p className="text-xs text-[#6B7280]">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated report preview */}
          {report && !generating && (
            <ReportPreview
              report={report}
              student={reportStudent}
              sending={sending}
              sendSuccess={sendSuccess}
              sendError={sendError}
              onSend={sendReport}
              onRegenerate={handleGenerate}
            />
          )}
        </div>
      </div>

      {/* ── Past Reports Note ──────────────────────────────── */}
      <div className="mt-6 p-4 bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#9CA3AF] mt-0.5 shrink-0" />
        <p className="text-xs text-[#6B7280] leading-relaxed">
          <strong className="text-[#1A1A2E]">Note:</strong> Reports are generated fresh each time
          using the latest attendance and grade data from the database.
          Each report is unique and tailored to the student's current performance.
          Make sure your <code className="bg-[#F3F4F6] px-1 rounded text-[#7C3AED]">GROQ_API_KEY</code> is
          set in <code className="bg-[#F3F4F6] px-1 rounded text-[#7C3AED]">backend/.env</code> for this to work.
        </p>
      </div>

    </Layout>
  )
}