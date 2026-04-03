const files = [
  './src/controllers/auth.controller',
  './src/controllers/teacher.controller',
  './src/controllers/student.controller',
  './src/controllers/attendance.controller',
  './src/controllers/grade.controller',
  './src/controllers/alert.controller',
  './src/controllers/timetable.controller',
  './src/controllers/report.controller',
  './src/controllers/admin.controller',
]

files.forEach(f => {
  try {
    const m = require(f)
    console.log('OK :', f, '\n     exports:', Object.keys(m).join(', '), '\n')
  } catch(e) {
    console.log('ERR:', f, '\n     error:', e.message, '\n')
  }
})