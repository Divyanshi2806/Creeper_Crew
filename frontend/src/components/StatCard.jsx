// StatCard.jsx — The small number cards shown at the top of dashboards
// e.g. "Total Students: 30", "Attendance Rate: 87%"

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'purple', trend }) {

  // Colour variants for the icon background
  const colorMap = {
    purple: 'bg-[#EDE9FE] text-[#7C3AED]',
    green:  'bg-emerald-50 text-emerald-600',
    yellow: 'bg-amber-50 text-amber-600',
    red:    'bg-red-50 text-red-600',
    blue:   'bg-blue-50 text-blue-600',
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-3xl font-display font-bold text-[#1A1A2E] leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#6B7280] mt-1.5">{subtitle}</p>
          )}
          {/* Optional trend indicator */}
          {trend && (
            <p className={`text-xs font-medium mt-1.5 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )
}