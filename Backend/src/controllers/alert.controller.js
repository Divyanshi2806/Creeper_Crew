const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAlerts = async (req, res) => {
  const teacherId = req.user.id

  const classes = await prisma.class.findMany({
    where: { teacherId },
    select: { id: true }
  })
  const classIds = classes.map(c => c.id)

  const alerts = await prisma.alert.findMany({
    where: {
      student: { classId: { in: classIds } }
    },
    include: {
      student: { include: { class: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  res.json({ alerts })
}

const markAsRead = async (req, res) => {
  const alertId = parseInt(req.params.id)

  const alert = await prisma.alert.update({
    where: { id: alertId },
    data: { isRead: true }
  })

  res.json({ message: 'Alert marked as read.', alert })
}

const markAllAsRead = async (req, res) => {
  const teacherId = req.user.id

  const classes = await prisma.class.findMany({
    where: { teacherId },
    select: { id: true }
  })
  const classIds = classes.map(c => c.id)

  await prisma.alert.updateMany({
    where: {
      student: { classId: { in: classIds } },
      isRead: false,
    },
    data: { isRead: true }
  })

  res.json({ message: 'All alerts marked as read.' })
}

module.exports = { getAlerts, markAsRead, markAllAsRead }