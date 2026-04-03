import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')
   await prisma.alert.deleteMany()
  await prisma.grade.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.timetable.deleteMany()
  await prisma.student.deleteMany()
  await prisma.class.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.admin.deleteMany()
  console.log('🧹 Cleared old data')
  
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.create({
    data: {
      name: 'Principal Sharma',
      email: 'admin@eduease.com',
      password: adminPassword,
    }
  })
  console.log('✅ Admin created:', admin.email)
  
  const teacherPassword = await bcrypt.hash('teacher123', 10)

  const teacher1 = await prisma.teacher.create({
    data: { name: 'Priya Mehta',   email: 'priya@eduease.com',   password: teacherPassword, subject: 'Mathematics' }
  })
  const teacher2 = await prisma.teacher.create({
    data: { name: 'Arjun Kapoor',  email: 'arjun@eduease.com',   password: teacherPassword, subject: 'Science' }
  })
  const teacher3 = await prisma.teacher.create({
    data: { name: 'Sneha Reddy',   email: 'sneha@eduease.com',   password: teacherPassword, subject: 'English' }
  })
  console.log('✅ Teachers created')
  const class10A = await prisma.class.create({
    data: { name: 'Class 10A', grade: '10', section: 'A', teacherId: teacher1.id }
  })
  const class10B = await prisma.class.create({
    data: { name: 'Class 10B', grade: '10', section: 'B', teacherId: teacher2.id }
  })
  const class10C = await prisma.class.create({
    data: { name: 'Class 10C', grade: '10', section: 'C', teacherId: teacher3.id }
  })
  console.log('✅ Classes created')

  const studentNames10A = [
    'Aarav Shah', 'Diya Patel', 'Rohan Gupta', 'Ananya Singh', 'Kabir Joshi',
    'Ishaan Verma', 'Priyanka Nair', 'Aryan Mishra', 'Kavya Iyer', 'Vihaan Desai'
  ]
  const studentNames10B = [
    'Aditi Sharma', 'Siddharth Roy', 'Meera Pillai', 'Aditya Kumar', 'Riya Chatterjee',
    'Vivaan Bose', 'Pooja Menon', 'Arnav Ghosh', 'Nisha Rao', 'Dev Malhotra'
  ]
  const studentNames10C = [
    'Tanvi Choudhary', 'Karan Bajaj', 'Shreya Pandey', 'Nikhil Jain', 'Pia Saxena',
    'Rahul Trivedi', 'Simran Kohli', 'Yash Aggarwal', 'Ruchika Tiwari', 'Harsh Dubey'
  ]

  async function createStudents(names, classId, sectionCode) {
    const students = []
    for (let i = 0; i < names.length; i++) {
      const firstName = names[i].split(' ')[0].toLowerCase()
      const student = await prisma.student.create({
        data: {
          name: names[i],
          email: `${firstName}.student@eduease.com`,
          parentEmail: `${firstName}.parent@gmail.com`,
          rollNumber: `${sectionCode}-${String(i + 1).padStart(2, '0')}`,
          classId: classId,
        }
      })
      students.push(student)
    }
    return students
  }

  const students10A = await createStudents(studentNames10A, class10A.id, '10A')
  const students10B = await createStudents(studentNames10B, class10B.id, '10B')
  const students10C = await createStudents(studentNames10C, class10C.id, '10C')
  const allStudents = [...students10A, ...students10B, ...students10C]
  console.log('✅ 30 students created')

  function getPastWeekdays(numDays) {
    const days = []
    const today = new Date()
    let current = new Date(today)
    current.setDate(current.getDate() - 1) // start from yesterday
    while (days.length < numDays) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
        days.push(new Date(current))
      }
      current.setDate(current.getDate() - 1)
    }
    return days
  }

  const past14Days = getPastWeekdays(14)

  function randomStatus(studentIndex) {
    if (studentIndex === 2 || studentIndex === 7) {
        const rand = Math.random()
      return rand < 0.5 ? 'absent' : rand < 0.65 ? 'late' : 'present'
    }
    const rand = Math.random()
    return rand < 0.75 ? 'present' : rand < 0.88 ? 'late' : 'absent'
  }

  for (const student of allStudents) {
    for (const date of past14Days) {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: student.classId,
          date: date,
          status: randomStatus(allStudents.indexOf(student)),
        }
      })
    }
  }
  console.log('✅ Attendance records created (14 days × 30 students)')
 const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography']

  const topicsBySubject = {
    'Mathematics': ['Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
    'Science':     ['Physics - Motion', 'Chemistry - Atoms', 'Biology - Cells', 'Electricity'],
    'English':     ['Grammar', 'Comprehension', 'Essay Writing', 'Literature'],
    'History':     ['Ancient India', 'Mughal Empire', 'Freedom Movement', 'World Wars'],
    'Geography':   ['Maps & Scale', 'Climate', 'Natural Resources', 'Population'],
  }

  function daysAgo(n) {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d
  }

  for (const student of allStudents) {
    for (const subject of subjects) {
      const topics = topicsBySubject[subject]
      for (let t = 0; t < topics.length; t++) {
        // Some students perform poorly on certain topics (for heatmap testing)
        let marks
        if (student.name === 'Rohan Gupta' && subject === 'Mathematics') {
          marks = 20 + Math.random() * 15 // consistently low
        } else if (student.name === 'Vihaan Desai' && subject === 'Science') {
          marks = 25 + Math.random() * 10
        } else {
          marks = 45 + Math.random() * 50 // normal range: 45–95
        }

        await prisma.grade.create({
          data: {
            studentId: student.id,
            subject: subject,
            topic: topics[t],
            marks: Math.round(marks),
            maxMarks: 100,
            examDate: daysAgo(t * 7 + 3), // spread over past weeks
          }
        })
      }
    }
  }
  console.log('✅ Grade records created (5 subjects × 4 topics × 30 students)')

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const periods = [
    { period: 1, start: '08:00', end: '08:45' },
    { period: 2, start: '08:45', end: '09:30' },
    { period: 3, start: '09:45', end: '10:30' }, // after break
    { period: 4, start: '10:30', end: '11:15' },
    { period: 5, start: '12:00', end: '12:45' }, // after lunch
    { period: 6, start: '12:45', end: '13:30' },
  ]

  const scheduleFor10A = {
    'Monday':    ['Mathematics', 'Science', 'English', 'History', 'Mathematics', 'Geography'],
    'Tuesday':   ['Science', 'English', 'Mathematics', 'Geography', 'History', 'Mathematics'],
    'Wednesday': ['English', 'Mathematics', 'History', 'Mathematics', 'Science', 'English'],
    'Thursday':  ['History', 'Geography', 'Science', 'English', 'Mathematics', 'Science'],
    'Friday':    ['Geography', 'Mathematics', 'Geography', 'Science', 'English', 'History'],
  }

  for (const day of days) {
    for (let i = 0; i < periods.length; i++) {
      await prisma.timetable.create({
        data: {
          classId: class10A.id,
          teacherId: teacher1.id,
          subject: scheduleFor10A[day][i],
          day,
          period: periods[i].period,
          startTime: periods[i].start,
          endTime: periods[i].end,
        }
      })
    }
  }

  for (const day of days) {
    for (let i = 0; i < periods.length; i++) {
      await prisma.timetable.create({
        data: {
          classId: class10B.id,
          teacherId: teacher2.id,
          subject: subjects[i % subjects.length],
          day,
          period: periods[i].period,
          startTime: periods[i].start,
          endTime: periods[i].end,
        }
      })
      await prisma.timetable.create({
        data: {
          classId: class10C.id,
          teacherId: teacher3.id,
          subject: subjects[(i + 2) % subjects.length],
          day,
          period: periods[i].period,
          startTime: periods[i].start,
          endTime: periods[i].end,
        }
      })
    }
  }
  console.log('✅ Timetable created (5 days × 6 periods × 3 classes)')

  await prisma.alert.create({
    data: {
      studentId: students10A[2].id, // Rohan Gupta
      type: 'attendance',
      message: 'Rohan Gupta has attendance of 52% — below the 75% threshold.',
      isRead: false,
    }
  })
  await prisma.alert.create({
    data: {
      studentId: students10A[2].id, // Rohan Gupta
      type: 'grade_drop',
      message: 'Rohan Gupta\'s Mathematics score dropped by 28% since last assessment.',
      isRead: false,
    }
  })
  await prisma.alert.create({
    data: {
      studentId: students10A[9].id, // Vihaan Desai
      type: 'attendance',
      message: 'Vihaan Desai has attendance of 61% — below the 75% threshold.',
      isRead: false,
    }
    })
  await prisma.alert.create({
    data: {
      studentId: students10B[7].id, // Arnav Ghosh
      type: 'grade_drop',
      message: 'Arnav Ghosh\'s Science score dropped by 19% since last assessment.',
      isRead: false,
    }
  })
  console.log('✅ Alerts created')

  console.log('\n🎉 Seed complete! Here are your login credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👑 Admin:   admin@eduease.com   / admin123')
  console.log('👩‍🏫 Teacher1: priya@eduease.com   / teacher123  (Maths, Class 10A)')
  console.log('👨‍🏫 Teacher2: arjun@eduease.com   / teacher123  (Science, Class 10B)')
  console.log('👩‍🏫 Teacher3: sneha@eduease.com   / teacher123  (English, Class 10C)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })