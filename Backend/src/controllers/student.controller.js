const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getStudents = async (req, res) => {
  const { classId } = req.query

  const where = classId ? { classId: parseInt(classId) } : {}

  const students = await prisma.student.findMany({
    where,
    include: { class: true },
    orderBy: { rollNumber: 'asc' }
  })

  res.json({ students })
}

const getStudentProfile = async (req, res) => {
  const studentId = parseInt(req.params.id)

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: true,
      attendance: { orderBy: { date: 'desc' }, take: 30 },
      grades: { orderBy: { examDate: 'desc' } },
      alerts: { orderBy: { createdAt: 'desc' } },
    }
  })

  if (!student) return res.status(404).json({ error: 'Student not found.' })

    const totalDays = student.attendance.length
  const presentDays = student.attendance.filter(a => a.status === 'present').length
  const lateDays = student.attendance.filter(a => a.status === 'late').length

  const attendancePercent = totalDays > 0
    ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100)
    : 0

     const gradesBySubject = student.grades.reduce((acc, grade) => {
    if (!acc[grade.subject]) acc[grade.subject] = []
    acc[grade.subject].push({
      topic: grade.topic,
      marks: grade.marks,
      maxMarks: grade.maxMarks,
      percentage: Math.round((grade.marks / grade.maxMarks) * 100),
      examDate: grade.examDate,
    })
    return acc
  }, {})

  res.json({
    student: {
      ...student,
      attendancePercent,
      gradesBySubject,
    }
  })
}

const createStudent = async (req, res) => {
  const { name, email, parentEmail, rollNumber, classId } = req.body

  if (!name || !email || !parentEmail || !rollNumber || !classId) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  const student = await prisma.student.create({
    data: { name, email, parentEmail, rollNumber, classId: parseInt(classId) },
    include: { class: true }
  })

  res.status(201).json({ message: 'Student created.', student })
}

const updateStudent = async (req, res) => {
  const studentId = parseInt(req.params.id)
  const { name, email, parentEmail, rollNumber, classId } = req.body

  const student = await prisma.student.update({
    where: { id: studentId },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(parentEmail && { parentEmail }),
      ...(rollNumber && { rollNumber }),
      ...(classId && { classId: parseInt(classId) }),
    },
    include: { class: true }
  })

  res.json({ message: 'Student updated.', student })
}

const deleteStudent = async (req, res) => {
  const studentId = parseInt(req.params.id)
  await prisma.attendance.deleteMany({ where: { studentId } })
  await prisma.grade.deleteMany({ where: { studentId } })
  await prisma.alert.deleteMany({ where: { studentId } })
  await prisma.student.delete({ where: { id: studentId } })

  res.json({ message: 'Student deleted successfully.' })
}

module.exports = { getStudents, getStudentProfile, createStudent, updateStudent, deleteStudent }