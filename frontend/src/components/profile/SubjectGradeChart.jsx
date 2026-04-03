// SubjectGradeChart.jsx — Line chart showing grade trend for one subject
// Each point = one topic/exam. Red dashed line at 40% = pass threshold.

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

// Custom tooltip shown on hover
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const value = payload[0].value
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-[#1A1A2E] mb-1">{label}</p>
      <p className={`font-bold ${value >= 40 ? 'text-emerald-600' : 'text-red-500'}`}>
        {value}% — {value >= 40 ? '✓ Pass' : '✗ Fail'}
      </p>
    </div>
  )
}

export default function SubjectGradeChart({ subject, grades }) {
  // grades = [{ topic, percentage, examDate }]
  const data = grades.map(g => ({
    name:       g.topic.length > 14 ? g.topic.slice(0, 14) + '…' : g.topic,
    percentage: g.percentage,
  }))

  const avg = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.percentage, 0) / data.length)
    : 0

  const avgColor =
    avg >= 75 ? '#10B981' :
    avg >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-[#1A1A2E]">{subject}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7280]">Avg:</span>
          <span className="text-sm font-bold" style={{ color: avgColor }}>{avg}%</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ color: avgColor, backgroundColor: avgColor + '18' }}
          >
            {avg >= 40 ? 'Pass' : 'Fail'}
          </span>
        </div>
      </div>

      {/* Line chart */}
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />

          {/* Pass/fail reference line at 40% */}
          <ReferenceLine
            y={40}
            stroke="#EF4444"
            strokeDasharray="4 4"
            label={{ value: '40%', position: 'insideTopRight', fontSize: 9, fill: '#EF4444' }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#7C3AED"
            strokeWidth={2.5}
            dot={{ fill: '#7C3AED', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: '#5B21B6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}