// AttendanceCalendar.jsx — Visual calendar showing attendance for past 30 days
// Green = present, Red = absent, Yellow = late, Grey = weekend / no data

export default function AttendanceCalendar({ attendance }) {
  // Build a date → status lookup map
  const statusMap = {}
  attendance.forEach(record => {
    const d   = new Date(record.date)
    const key = d.toISOString().split('T')[0]
    statusMap[key] = record.status
  })

  // Generate past 35 days to fill a 5-week grid neatly
  const days = []
  for (let i = 34; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d)
  }

  const statusStyle = {
    present: { bg: 'bg-emerald-400', label: 'Present' },
    absent:  { bg: 'bg-red-400',     label: 'Absent'  },
    late:    { bg: 'bg-amber-400',   label: 'Late'    },
  }

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div>
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-[#9CA3AF]">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty offset cells before the first day */}
        {Array(days[0].getDay()).fill(null).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map(day => {
          const key       = day.toISOString().split('T')[0]
          const status    = statusMap[key]
          const isWeekend = day.getDay() === 0 || day.getDay() === 6
          const isFuture  = day > new Date()
          const style     = status ? statusStyle[status] : null

          return (
            <div
              key={key}
              title={style ? `${key}: ${style.label}` : key}
              className={`
                aspect-square rounded-md flex items-center justify-center
                text-[10px] font-medium cursor-default select-none
                ${isFuture  ? 'bg-[#F9FAFB] text-[#E5E7EB]'    :
                  isWeekend ? 'bg-[#F3F4F6] text-[#D1D5DB]'    :
                  style     ? `${style.bg} text-white`           :
                              'bg-[#F3F4F6] text-[#9CA3AF]'}
              `}
            >
              {day.getDate()}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3">
        {[
          { color: 'bg-emerald-400', label: 'Present'         },
          { color: 'bg-red-400',     label: 'Absent'          },
          { color: 'bg-amber-400',   label: 'Late'            },
          { color: 'bg-[#F3F4F6]',  label: 'Weekend/No data' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span className="text-[10px] text-[#6B7280]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}