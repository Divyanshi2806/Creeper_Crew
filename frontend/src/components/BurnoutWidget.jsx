// BurnoutWidget.jsx — Shows teacher burnout score 0-100
// Green (low) → Yellow (medium) → Red (high)

export default function BurnoutWidget({ score = 0 }) {

  // Determine colour and label based on score range
  const getConfig = (s) => {
    if (s <= 33)  return { color: '#10B981', bg: '#ECFDF5', label: 'Low',    text: "You're managing well. Keep it up!" }
    if (s <= 66)  return { color: '#F59E0B', bg: '#FFFBEB', label: 'Medium', text: 'Moderate load. Consider delegating some tasks.' }
    return              { color: '#EF4444', bg: '#FEF2F2', label: 'High',   text: 'High workload detected. Take breaks when possible.' }
  }

  const { color, bg, label, text } = getConfig(score)

  // The gauge arc is drawn as an SVG semicircle
  // circumference of a semicircle with r=45: π × r ≈ 141.4
  const radius = 45
  const circumference = Math.PI * radius
  // How much of the arc to fill based on score
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            Burnout Score
          </p>
          <p className="text-sm text-[#6B7280] mt-0.5">Based on your current workload</p>
        </div>
        {/* Colour-coded badge */}
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: bg, color }}
        >
          {label}
        </span>
      </div>

      {/* SVG Gauge */}
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-20 overflow-hidden">
          <svg
            viewBox="0 0 100 50"
            className="w-full h-full"
          >
            {/* Background track — grey semicircle */}
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Filled arc — coloured based on score */}
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
            />
          </svg>

          {/* Score number in center of arc */}
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <div className="text-center">
              <p className="font-display text-3xl font-bold leading-none" style={{ color }}>
                {score}
              </p>
              <p className="text-[10px] text-[#6B7280]">/ 100</p>
            </div>
          </div>
        </div>

        {/* Label row: 0 — Low — Medium — High — 100 */}
        <div className="flex justify-between w-40 mt-1">
          <span className="text-[10px] text-[#6B7280]">0</span>
          <span className="text-[10px] text-[#6B7280]">100</span>
        </div>

        {/* Advice text */}
        <p className="text-xs text-center text-[#6B7280] mt-3 max-w-45 leading-relaxed">
          {text}
        </p>
      </div>

      {/* Score breakdown bars */}
      <div className="mt-4 space-y-2">
        {[
          { label: 'Classes',  value: Math.min(100, score * 1.2), color: '#7C3AED' },
          { label: 'Students', value: Math.min(100, score * 0.9), color: '#06B6D4' },
          { label: 'Alerts',   value: Math.min(100, score * 0.7), color: '#F59E0B' },
        ].map(bar => (
          <div key={bar.label} className="flex items-center gap-2">
            <p className="text-[11px] text-[#6B7280] w-14">{bar.label}</p>
            <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${bar.value}%`, backgroundColor: bar.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}