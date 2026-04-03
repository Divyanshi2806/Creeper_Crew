const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAdminDashboard = async (req, res) => {
  const [
    totalTeachers,
    totalStudents,
    totalClasses,
    unreadAlerts,
    recentAlerts,
  ] = await Promise.all([
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.class.count(),
    prisma.alert.count({ where: { isRead: false } }),
    prisma.alert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { student: { include: { class: true } } }
    }),
  ])

  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const allAttendance = await prisma.attendance.findMany({
    where: { date: { gte: twoWeeksAgo } }
  })
  const presentCount = allAttendance.filter(a => a.status === 'present').length
  const schoolAttendanceRate = allAttendance.length > 0
    ? Math.round((presentCount / allAttendance.length) * 100)
    : 0

  const classes = await prisma.class.findMany({
    include: {
      teacher: { select: { name: true, subject: true } },
      students: { include: { grades: true, attendance: true } }
    }
  })

  const classStats = classes.map(cls => {
    const studentCount = cls.students.length
    const allGrades = cls.students.flatMap(s => s.grades)
    const avgGrade = allGrades.length > 0
      ? Math.round(allGrades.reduce((sum, g) => sum + (g.marks / g.maxMarks) * 100, 0) / allGrades.length)
      : 0
    const allAtt = cls.students.flatMap(s => s.attendance)
    const attRate = allAtt.length > 0
      ? Math.round(allAtt.filter(a => a.status === 'present').length / allAtt.length * 100)
      : 0
    return {
      id: cls.id,
      name: cls.name,
      teacher: cls.teacher.name,
      subject: cls.teacher.subject,
      studentCount,
      avgGrade,
      attendanceRate: attRate,
    }
  })

  const teachers = await prisma.teacher.findMany({
    select: { id: true, name: true, subject: true, email: true },
    orderBy: { name: 'asc' }
  })

  const teacherWorkloads = await Promise.all(
    teachers.map(async t => {
      const classCount = await prisma.class.count({ where: { teacherId: t.id } })
      const studentCount = await prisma.student.count({
        where: { class: { teacherId: t.id } }
      })
      const periodCount = await prisma.timetable.count({ where: { teacherId: t.id } })
      return { ...t, classCount, studentCount, periodCount }
    })
  )

  res.json({
    stats: { totalTeachers, totalStudents, totalClasses, unreadAlerts, schoolAttendanceRate },
    recentAlerts,
    classStats,
    teacherWorkloads,
  })
}

module.exports = { getAdminDashboard }