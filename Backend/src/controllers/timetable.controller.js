const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getTimetable = async (req, res) => {
  const teacherId = req.query.teacherId
    ? parseInt(req.query.teacherId)
    : req.user.id

    const timetable = await prisma.timetable.findMany({
    where: { teacherId },
    include: { class: true },
    orderBy: [{ day: 'asc' }, { period: 'asc' }]
  })
  const byDay = {}
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  days.forEach(day => { byDay[day] = [] })
  timetable.forEach(slot => {
    if (byDay[slot.day]) byDay[slot.day].push(slot)
  })

  res.json({ timetable, byDay })
}

const updateTimetableSlot = async (req, res) => {
  const slotId = parseInt(req.params.id)
  const { subject, teacherId, startTime, endTime } = req.body

  const slot = await prisma.timetable.update({
    where: { id: slotId },
    data: {
      ...(subject && { subject }),
      ...(teacherId && { teacherId: parseInt(teacherId) }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
    },
    include: { class: true, teacher: true }
  })

  res.json({ message: 'Timetable updated.', slot })
}

module.exports = { getTimetable, updateTimetableSlot }