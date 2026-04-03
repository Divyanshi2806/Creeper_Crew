// StudentSelector.jsx — Dropdown + student info card for selecting who to report on

import { User, ChevronDown } from 'lucide-react'

export default function StudentSelector({
  students, classes, selectedStudentId,
  onSelect, loadingStudents
}) {
  // Find the selected student object
  const selectedStudent = students.find(s => String(s.id) === String(selectedStudentId))

  // Group students by class for the dropdown
  const studentsByClass = students.reduce((acc, s) => {
    const className = s.class?.name || 'Unknown Class'
    if (!acc[className]) acc[className] = []
    acc[className].push(s)
    return acc
  }, {})

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
      <h2 className="font-display font-bold text-base text-[#1A1A2E] mb-4">
        Select Student
      </h2>

      {/* Dropdown */}
      <div className="relative mb-4">
        <select
          value={selectedStudentId}
          onChange={e => onSelect(e.target.value)}
          disabled={loadingStudents}
          className="w-full appearance-none bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#1A1A2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED] pr-10 cursor-pointer disabled:opacity-50"
        >
          <option value="">
            {loadingStudents ? 'Loading students...' : 'Choose a student...'}
          </option>

          {/* Group by class */}
          {Object.entries(studentsByClass).map(([className, classStudents]) => (
            <optgroup key={className} label={className}>
              {classStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rollNumber})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
      </div>

      {/* Selected student info card */}
      {selectedStudent ? (
        <div className="flex items-center gap-4 p-4 bg-[#F5F3FF] rounded-xl border border-[#DDD6FE]">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED] flex items-center justify-center shrink-0">
            <span className="text-white text-lg font-bold">
              {selectedStudent.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-[#1A1A2E]">{selectedStudent.name}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {selectedStudent.class?.name} · Roll: {selectedStudent.rollNumber}
            </p>
            <p className="text-xs text-[#7C3AED] mt-0.5">
              Parent: {selectedStudent.parentEmail}
            </p>
          </div>
        </div>
      ) : (
        // Placeholder when nothing is selected
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-12 h-12 bg-[#F3F4F6] rounded-xl flex items-center justify-center mb-2">
            <User className="w-6 h-6 text-[#D1D5DB]" />
          </div>
          <p className="text-sm text-[#9CA3AF]">No student selected</p>
        </div>
      )}
    </div>
  )
}