const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAttendance = async (req, res) => {
  const { classId, date } = req.query

  if (!classId || !date) {
    return res.status(400).json({ error: 'classId and date are required.' })
  }

  const targetDate = new Date(date)
  // Set to start of day to avoid timezone issues
  targetDate.setHours(0, 0, 0, 0)
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)

  const students = await prisma.student.findMany({
    where: { classId: parseInt(classId) },
    orderBy: { rollNumber: 'asc' }
  })

  const records = await prisma.attendance.findMany({
    where: {
      classId: parseInt(classId),
      date: { gte: targetDate, lt: nextDay }
    }
  })

  const recordMap = {}
  records.forEach(r => { recordMap[r.studentId] = r.status })

  const result = students.map(s => ({
    ...s,
    status: recordMap[s.id] || null // null means not marked yet
  }))

  res.json({ students: result, date: targetDate })
}

const saveAttendance = async (req, res) => {
  const { classId, date, records } = req.body

  if (!classId || !date || !records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'classId, date, and records array are required.' })
  }

  const targetDate = new Date(date)
  targetDate.setHours(12, 0, 0, 0)

  const results = await Promise.all(
    records.map(({ studentId, status }) =>
      prisma.attendance.upsert({
        where: {
          studentId_classId_date: {
            studentId: parseInt(studentId),
            classId: parseInt(classId),
            date: targetDate,
          }
        },
        update: { status },
        create: {
          studentId: parseInt(studentId),
          classId: parseInt(classId),
          date: targetDate,
          status,
        }
      })
    )
  )

  await checkAttendanceAlerts(classId, req.io)

  res.json({ message: 'Attendance saved successfully.', count: results.length })
}

const getAttendanceSummary = async (req, res) => {
  const { classId } = req.query

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const students = await prisma.student.findMany({
    where: { classId: parseInt(classId) },
    include: {
      attendance: {
        where: { date: { gte: thirtyDaysAgo } }
      }
    },
    orderBy: { rollNumber: 'asc' }
  })

  const summary = students.map(student => {
    const total = student.attendance.length
    const present = student.attendance.filter(a => a.status === 'present').length
    const late = student.attendance.filter(a => a.status === 'late').length
    const absent = student.attendance.filter(a => a.status === 'absent').length
    const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0

    return {
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      present, late, absent, total,
      percentage,
      isAtRisk: percentage < 75, // flag for UI
    }
  })

  res.json({ summary })
}

async function checkAttendanceAlerts(classId, io) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const students = await prisma.student.findMany({
    where: { classId: parseInt(classId) },
    include: {
      attendance: { where: { date: { gte: thirtyDaysAgo } } },
      class: { include: { teacher: true } }
    }
  })

  for (const student of students) {
    const total = student.attendance.length
    if (total === 0) continue

    const present = student.attendance.filter(a => a.status === 'present').length
    const late = student.attendance.filter(a => a.status === 'late').length
    const percentage = Math.round(((present + late * 0.5) / total) * 100)

    if (percentage < 75) {
      const existingAlert = await prisma.alert.findFirst({
        where: { studentId: student.id, type: 'attendance', isRead: false }
      })

      if (!existingAlert) {
        const alert = await prisma.alert.create({
          data: {
            studentId: student.id,
            type: 'attendance',
            message: `${student.name} has attendance of ${percentage}% — below the 75% threshold.`,
            isRead: false,
          },
          include: { student: true }
        })

        if (io) {
          io.to(`teacher_${student.class.teacherId}`).emit('new_alert', alert)
        }
      }
    }
  }
}

module.exports = { getAttendance, saveAttendance, getAttendanceSummary }
