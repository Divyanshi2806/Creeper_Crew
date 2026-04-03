// ScheduleCard.jsx — Displays a single class period in today's schedule

export default function ScheduleCard({ slot, index }) {

  // Alternate accent colours for variety
  const accents = [
    { bg: '#F5F3FF', border: '#DDD6FE', dot: '#7C3AED', text: '#5B21B6' },
    { bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981', text: '#065F46' },
    { bg: '#FFF7ED', border: '#FED7AA', dot: '#F59E0B', text: '#92400E' },
    { bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6', text: '#1E40AF' },
    { bg: '#FDF2F8', border: '#F9A8D4', dot: '#EC4899', text: '#9D174D' },
    { bg: '#F0FDF4', border: '#BBF7D0', dot: '#22C55E', text: '#14532D' },
  ]
  const accent = accents[index % accents.length]

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm cursor-default"
      style={{ backgroundColor: accent.bg, borderColor: accent.border }}
    >
      {/* Period number bubble */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
        style={{ backgroundColor: accent.dot + '25', color: accent.dot }}
      >
        P{slot.period}
      </div>

      {/* Subject + class info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[#1A1A2E] truncate">
          {slot.subject}
        </p>
        <p className="text-xs mt-0.5" style={{ color: accent.text }}>
          {slot.class?.name}
        </p>
      </div>

      {/* Time */}
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-[#1A1A2E]">{slot.startTime}</p>
        <p className="text-xs text-[#6B7280]">{slot.endTime}</p>
      </div>
    </div>
  )
}