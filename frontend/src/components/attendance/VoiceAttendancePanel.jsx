// VoiceAttendancePanel.jsx — Mic button + live feedback for voice attendance

import { Mic, MicOff, Volume2 } from 'lucide-react'

export default function VoiceAttendancePanel({
  listening, transcript, matchedName, error,
  isSupported, onStart, onStop
}) {
  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 ${
      listening
        ? 'bg-[#F5F3FF] border-[#7C3AED] shadow-md'
        : 'bg-white border-[#E5E7EB]'
    }`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm text-[#1A1A2E]">Voice Attendance</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {isSupported
              ? 'Click mic and say a student\'s name'
              : 'Not supported — use Chrome browser'}
          </p>
        </div>

        {/* Mic Button */}
        <button
          onClick={listening ? onStop : onStart}
          disabled={!isSupported}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
            listening
              ? 'bg-[#7C3AED] shadow-lg shadow-purple-300 scale-110'
              : 'bg-[#EDE9FE] hover:bg-[#DDD6FE]'
          }`}
        >
          {listening
            ? <MicOff className="w-6 h-6 text-white" />
            : <Mic className="w-6 h-6 text-[#7C3AED]" />
          }
        </button>
      </div>

      {/* Listening animation */}
      {listening && (
        <div className="flex items-center gap-2 mb-3">
          {/* Animated sound wave bars */}
          <div className="flex items-end gap-0.5 h-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-[#7C3AED] rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 16 + 8}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-[#7C3AED]">Listening...</span>
        </div>
      )}

      {/* What was heard */}
      {transcript && (
        <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-[#E5E7EB] mb-2">
          <Volume2 className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-[#6B7280]">I heard:</p>
            <p className="text-sm font-medium text-[#1A1A2E]">"{transcript}"</p>
          </div>
        </div>
      )}

      {/* Match result */}
      {matchedName && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="text-lg">✅</span>
          <div>
            <p className="text-xs text-emerald-600 font-medium">Matched & marked present:</p>
            <p className="text-sm font-bold text-emerald-700">{matchedName}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-200">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Instructions */}
      {!listening && !transcript && (
        <div className="mt-2 space-y-1.5">
          <p className="text-xs font-medium text-[#6B7280]">How to use:</p>
          {[
            '1. Click the mic button',
            '2. Say the student\'s name clearly',
            '3. They will be marked present',
            '4. Repeat for each student',
          ].map(step => (
            <p key={step} className="text-xs text-[#9CA3AF]">{step}</p>
          ))}
        </div>
      )}
    </div>
  )
}