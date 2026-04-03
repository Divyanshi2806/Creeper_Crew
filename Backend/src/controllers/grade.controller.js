const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getGrades = async (req, res) => {
  const { classId, subject } = req.query

  const students = await prisma.student.findMany({
    where: { classId: parseInt(classId) },
    include: {
      grades: {
        where: subject ? { subject } : {},
        orderBy: { examDate: 'desc' }
      }
    },
    orderBy: { rollNumber: 'asc' }
  })

  res.json({ students })
}

const saveGrades = async (req, res) => {
  const { grades } = req.body

  if (!grades || !Array.isArray(grades)) {
    return res.status(400).json({ error: 'grades array is required.' })
  }

  const created = await Promise.all(
    grades.map(g =>
      prisma.grade.create({
        data: {
          studentId: parseInt(g.studentId),
          subject: g.subject,
          topic: g.topic,
          marks: parseFloat(g.marks),
          maxMarks: parseFloat(g.maxMarks),
          examDate: new Date(g.examDate),
        }
      })
    )
  )

  await checkGradeAlerts(grades, req.io)

  res.status(201).json({ message: 'Grades saved.', count: created.length })
}

const getHeatmap = async (req, res) => {
  const { classId } = req.query

  const students = await prisma.student.findMany({
    where: { classId: parseInt(classId) },
    select: { id: true }
  })

  const studentIds = students.map(s => s.id)

  const grades = await prisma.grade.findMany({
    where: { studentId: { in: studentIds } }
  })

  const heatmap = {}
  grades.forEach(g => {
    if (!heatmap[g.subject]) heatmap[g.subject] = {}
    if (!heatmap[g.subject][g.topic]) {
      heatmap[g.subject][g.topic] = { total: 0, count: 0 }
    }
    const pct = (g.marks / g.maxMarks) * 100
    heatmap[g.subject][g.topic].total += pct
    heatmap[g.subject][g.topic].count += 1
  })

  const result = Object.entries(heatmap).map(([subject, topics]) => ({
    subject,
    topics: Object.entries(topics).map(([topic, data]) => ({
      topic,
      average: Math.round(data.total / data.count),
      // Colour category: red < 40%, yellow 40–70%, green > 70%
      category: data.total / data.count < 40 ? 'weak'
               : data.total / data.count < 70 ? 'average'
               : 'strong'
    }))
  }))

  res.json({ heatmap: result })
}


const getStudentGrades = async (req, res) => {
  const studentId = parseInt(req.params.id)

  const grades = await prisma.grade.findMany({
    where: { studentId },
    orderBy: { examDate: 'asc' }
  })

  const bySubject = grades.reduce((acc, g) => {
    if (!acc[g.subject]) acc[g.subject] = []
    acc[g.subject].push({
      topic: g.topic,
      percentage: Math.round((g.marks / g.maxMarks) * 100),
      marks: g.marks,
      maxMarks: g.maxMarks,
      examDate: g.examDate,
      passed: (g.marks / g.maxMarks) >= 0.4,
    })
    return acc
  }, {})

  res.json({ grades, bySubject })
}

async function checkGradeAlerts(newGrades, io) {
  for (const g of newGrades) {
    const studentId = parseInt(g.studentId)
    const previous = await prisma.grade.findMany({
      where: { studentId, subject: g.subject },
      orderBy: { examDate: 'desc' },
      take: 2 // get last 2 to compare
    })

    if (previous.length >= 2) {
      const latestPct = (previous[0].marks / previous[0].maxMarks) * 100
      const prevPct = (previous[1].marks / previous[1].maxMarks) * 100
      const drop = prevPct - latestPct

      if (drop >= 15) {
        const student = await prisma.student.findUnique({
          where: { id: studentId },
          include: { class: true }
        })

        const existing = await prisma.alert.findFirst({
          where: { studentId, type: 'grade_drop', isRead: false }
        })

        if (!existing) {
          const alert = await prisma.alert.create({
            data: {
              studentId,
              type: 'grade_drop',
              message: `${student.name}'s ${g.subject} score dropped by ${Math.round(drop)}% since last assessment.`,
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
}

module.exports = { getGrades, saveGrades, getHeatmap, getStudentGrades }