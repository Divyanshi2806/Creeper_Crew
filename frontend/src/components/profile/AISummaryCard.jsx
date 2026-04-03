// AISummaryCard.jsx — Calls Claude API for a quick student progress summary
// Lighter than the full report — just 3 sentences shown inline on the profile

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'
import api from '@/utils/api'

export default function AISummaryCard({ student }) {
  const [summary,   setSummary]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    try {
      setLoading(true)
      setError('')
      // Reuse the report endpoint — teacherNotes steers it to be brief
      const res = await api.post('/reports/generate', {
        studentId:    student.id,
        teacherNotes: 'Write a brief 3-sentence progress overview for the teacher to review.',
      })
      setSummary(res.data.report)
      setGenerated(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate summary. Check your Claude API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-linear-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-2xl border border-[#DDD6FE] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#7C3AED] rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[#1A1A2E]">AI Progress Summary</p>
            <p className="text-[10px] text-[#6B7280]">Powered by Claude</p>
          </div>
        </div>

        {/* Regenerate — only shown after first generation */}
        {generated && !loading && (
          <button
            onClick={generate}
            className="flex items-center gap-1.5 text-xs text-[#7C3AED] hover:underline font-medium"
          >
            <RefreshCw className="w-3 h-3" />
            Regenerate
          </button>
        )}
      </div>

      {/* States */}
      {!generated && !loading && !error && (
        <div className="text-center py-5">
          <p className="text-sm text-[#6B7280] mb-4 leading-relaxed">
            Get an instant AI overview of <strong>{student.name.split(' ')[0]}</strong>'s
            attendance and academic performance.
          </p>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm shadow-purple-200"
          >
            <Sparkles className="w-4 h-4" />
            Generate Summary
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-6">
          {/* Bouncing dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-[#6B7280]">Claude is analysing the data...</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-200">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {summary && !loading && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-[#DDD6FE]">
          <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
        </div>
      )}
    </div>
  )
}