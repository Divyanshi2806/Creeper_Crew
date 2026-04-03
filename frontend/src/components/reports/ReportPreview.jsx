// ReportPreview.jsx — Displays the generated report with approve & send button

import { Send, Loader2, CheckCircle, Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function ReportPreview({
  report, student,
  sending, sendSuccess, sendError,
  onSend, onRegenerate,
}) {
  const [copied, setCopied] = useState(false)

  // Copy report text to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">

      {/* ── Card Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#FAFAFA]">
        <div>
          <h2 className="font-display font-bold text-base text-[#1A1A2E]">
            Generated Report
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            For {student?.name} · {student?.class}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-white transition-colors"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          {/* Regenerate button */}
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#7C3AED] border border-[#DDD6FE] bg-[#F5F3FF] rounded-lg hover:bg-[#EDE9FE] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        </div>
      </div>

      {/* ── Report body ───────────────────────────────────── */}
      <div className="p-6">
        {/* Simulated email preview */}
        <div className="border border-[#E5E7EB] rounded-xl overflow-hidden mb-6">
          {/* Email header bar */}
          <div className="bg-[#F9FAFB] px-4 py-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <span className="font-semibold text-[#1A1A2E]">To:</span>
              <span className="bg-[#EDE9FE] text-[#7C3AED] px-2 py-0.5 rounded-full font-medium">
                {student?.parentEmail}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-1.5">
              <span className="font-semibold text-[#1A1A2E]">Subject:</span>
              Progress Report — {student?.name} ({student?.class})
            </div>
          </div>

          {/* Report text area — editable so teacher can tweak */}
          <div className="p-5 bg-white">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
              Report Content (you can edit before sending)
            </p>
            <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
              {report}
            </p>
          </div>
        </div>

        {/* Student data used to generate */}
        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4 mb-5">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
            Data Used to Generate This Report
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-[#9CA3AF] uppercase font-semibold">Attendance</p>
              <p className={`text-sm font-bold ${
                student?.attendancePercent >= 75 ? 'text-emerald-600' :
                student?.attendancePercent >= 60 ? 'text-amber-600' : 'text-red-500'
              }`}>
                {student?.attendancePercent}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#9CA3AF] uppercase font-semibold">Class</p>
              <p className="text-sm font-bold text-[#1A1A2E]">{student?.class}</p>
            </div>
          </div>
          {student?.subjectGrades && (
            <div className="mt-3">
              <p className="text-[10px] text-[#9CA3AF] uppercase font-semibold mb-1.5">Subject Grades</p>
              <div className="space-y-1">
                {student.subjectGrades.split('\n').map((line, i) => (
                  <p key={i} className="text-xs text-[#374151]">• {line}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Send success message */}
        {sendSuccess && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-medium text-emerald-700">{sendSuccess}</p>
          </div>
        )}

        {/* Send error message */}
        {sendError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
            <p className="text-sm text-red-600">{sendError}</p>
          </div>
        )}

        {/* Approve & Send button */}
        <button
          onClick={() => onSend(student?.id, report)}
          disabled={sending || !!sendSuccess}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#7C3AED] hover:bg-[#5B21B6] disabled:bg-[#C4B5FD] text-white font-semibold rounded-xl transition-all duration-200 text-sm"
        >
          {sending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending email...</>
          ) : sendSuccess ? (
            <><CheckCircle className="w-4 h-4" /> Email Sent!</>
          ) : (
            <><Send className="w-4 h-4" /> Approve &amp; Send to Parent</>
          )}
        </button>

        <p className="text-center text-xs text-[#9CA3AF] mt-2">
          This will email the report to {student?.parentEmail}
        </p>
      </div>
    </div>
  )
}