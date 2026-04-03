const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getDashboard = async (req, res) => {
  const teacherId = req.user.id
  const classes = await prisma.class.findMany({
    where: { teacherId },
    include: {
      students: true,
    }
  })
  const classIds = classes.map(c => c.id)

  const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0)

  const unreadAlerts = await prisma.alert.count({
    where: {
      student: { classId: { in: classIds } },
      isRead: false,
    }
  })

  const today = new Date()
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayName = dayNames[today.getDay()]

  const todaySchedule = await prisma.timetable.findMany({
    where: { teacherId, day: todayName },
    include: { class: true },
    orderBy: { period: 'asc' }
  })

  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      classId: { in: classIds },
      date: { gte: twoWeeksAgo }
    }
  })

  const presentCount = attendanceRecords.filter(a => a.status === 'present').length
  const attendanceRate = attendanceRecords.length > 0
    ? Math.round((presentCount / attendanceRecords.length) * 100)
    : 0

    const burnoutScore = Math.min(100, Math.round(
    (classes.length * 15) +
    (unreadAlerts * 5) +
    (totalStudents * 0.8)
  ))

  const pendingTasks = unreadAlerts

  const recentAlerts = await prisma.alert.findMany({
    where: {
      student: { classId: { in: classIds } },
    },
    include: {
      student: { include: { class: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  res.json({
    teacher: req.user,
    classes,
    totalStudents,
    unreadAlerts,
    todaySchedule,
    attendanceRate,
    burnoutScore,
    pendingTasks,
    recentAlerts,
  })
}

const getTeacherWorkload = async (req, res) => {
  const teacherId = parseInt(req.params.id)

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: { id: true, name: true, email: true, subject: true }
  })

  if (!teacher) return res.status(404).json({ error: 'Teacher not found.' })

  const classes = await prisma.class.findMany({
    where: { teacherId },
    include: { students: true }
  })

  const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0)
  const totalPeriods = await prisma.timetable.count({ where: { teacherId } })

  res.json({
    teacher,
    classes,
    totalStudents,
    totalPeriods,
    classCount: classes.length,
  })
}

const getTimetable = async (req, res) => {
  const teacherId = req.user.id;

  const timetable = await prisma.timetable.findMany({
    where: { teacherId },
    include: {
      class: true,
    },
    orderBy: [
      { day: 'asc' },
      { period: 'asc' },
    ],
  });

  res.json({ timetable });
};

const updateTimetableSlot = async (req, res) => {
  const id = parseInt(req.params.id);
  const { subject, day, period, startTime, endTime } = req.body;

  const updated = await prisma.timetable.update({
    where: { id },
    data: {
      subject,
      day,
      period,
      startTime,
      endTime,
    },
  });

  res.json({ message: "Timetable updated", updated });
};

module.exports = {
  getDashboard,
  getTeacherWorkload,
  getTimetable,
  updateTimetableSlot,
};