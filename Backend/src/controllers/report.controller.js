// report.controller.js — Generates AI progress reports using Groq (free)
// and emails them to parents via Nodemailer

const Groq       = require('groq-sdk')
const nodemailer = require('nodemailer')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Initialise Groq client — reads GROQ_API_KEY from .env automatically
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ─────────────────────────────────────────────────────────────
// POST /api/reports/generate
// Body: { studentId, teacherNotes }
// Returns: { report, student }
// ─────────────────────────────────────────────────────────────
const generateReport = async (req, res) => {
  const { studentId, teacherNotes = '' } = req.body

  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required.' })
  }

  // ── 1. Fetch full student data from database ──────────────
  const student = await prisma.student.findUnique({
    where: { id: parseInt(studentId) },
    include: {
      class:      true,
      attendance: { orderBy: { date: 'desc' }, take: 30 },
      grades:     { orderBy: { examDate: 'desc' } },
    }
  })

  if (!student) {
    return res.status(404).json({ error: 'Student not found.' })
  }

  // ── 2. Calculate attendance percentage ────────────────────
  const totalDays   = student.attendance.length
  const presentDays = student.attendance.filter(a => a.status === 'present').length
  const lateDays    = student.attendance.filter(a => a.status === 'late').length
  const attendancePercent = totalDays > 0
    ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100)
    : 0

  // ── 3. Build subject-wise grade summary ───────────────────
  // Group grades by subject and compute average percentage
  const gradesBySubject = student.grades.reduce((acc, g) => {
    if (!acc[g.subject]) acc[g.subject] = { total: 0, max: 0 }
    acc[g.subject].total += g.marks
    acc[g.subject].max   += g.maxMarks
    return acc
  }, {})

  // Format as readable string e.g. "Mathematics: 78% (Pass)"
  const subjectGradesText = Object.entries(gradesBySubject)
    .map(([subject, data]) => {
      const pct = Math.round((data.total / data.max) * 100)
      return `${subject}: ${pct}% (${pct >= 40 ? 'Pass' : 'Fail'})`
    })
    .join('\n')

  // ── 4. Build the prompt ───────────────────────────────────
  const prompt = `You are a professional school report writer. Generate a warm, formal parent progress report for the following student. Keep it under 200 words. Be encouraging but honest.

Student: ${student.name}
Class: ${student.class.name}
Attendance: ${attendancePercent}% this month
Subjects and grades:
${subjectGradesText}
Teacher notes: ${teacherNotes || 'Student is making steady progress.'}

Write the report now:`

  // ── 5. Call Groq API (free, using Llama 3.3 70B model) ───
  const chatCompletion = await groq.chat.completions.create({
    model:       'llama-3.3-70b-versatile', // best free model on Groq
    max_tokens:  400,
    temperature: 0.7,  // slightly creative but still professional
    messages: [
      {
        role:    'system',
        content: 'You are a professional school report writer. Write formal, warm, and encouraging progress reports for parents.',
      },
      {
        role:    'user',
        content: prompt,
      }
    ],
  })

  // Extract the generated text from Groq response
  const reportText = chatCompletion.choices[0]?.message?.content || ''

  if (!reportText) {
    return res.status(500).json({ error: 'AI failed to generate a report. Please try again.' })
  }

  // ── 6. Return report + student info ──────────────────────
  res.json({
    report: reportText,
    student: {
      id:              student.id,
      name:            student.name,
      parentEmail:     student.parentEmail,
      class:           student.class.name,
      attendancePercent,
      subjectGrades:   subjectGradesText,
    }
  })
}

// ─────────────────────────────────────────────────────────────
// POST /api/reports/send
// Body: { studentId, reportText }
// Emails the report to the student's parent
// ─────────────────────────────────────────────────────────────
const sendReport = async (req, res) => {
  const { studentId, reportText } = req.body

  if (!studentId || !reportText) {
    return res.status(400).json({ error: 'studentId and reportText are required.' })
  }

  // Fetch student for their name, class, parent email
  const student = await prisma.student.findUnique({
    where:   { id: parseInt(studentId) },
    include: { class: true }
  })

  if (!student) {
    return res.status(404).json({ error: 'Student not found.' })
  }

  // ── Set up Nodemailer with Gmail ──────────────────────────
  // You need a Gmail App Password (not your normal password)
  // Guide: myaccount.google.com → Security → 2FA → App Passwords
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  })

  // ── Send the email ────────────────────────────────────────
  await transporter.sendMail({
    from:    `"EduEase School" <${process.env.EMAIL_USER}>`,
    to:      divyanshi2535Email,
    subject: `Progress Report — ${student.name} (${student.class.name})`,

    // Plain text fallback for email clients that don't render HTML
    text: reportText,

    // Nicely formatted HTML email
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff;">

        <!-- Purple header banner -->
        <div style="background: linear-gradient(135deg, #7C3AED, #5B21B6); padding: 32px 40px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">EduEase</h1>
          <p style="color: #C4B5FD; margin: 6px 0 0; font-size: 14px;">Student Progress Report</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 40px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1A1A2E; font-size: 20px; margin: 0 0 4px;">
            ${student.name}
          </h2>
          <p style="color: #6B7280; font-size: 14px; margin: 0 0 24px;">
            ${student.class.name} &nbsp;·&nbsp; Roll No: ${student.rollNumber}
          </p>

          <!-- Report text -->
          <div style="background: #FAFAFA; border-left: 4px solid #7C3AED; padding: 20px 24px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <p style="color: #374151; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap;">${reportText}</p>
          </div>

          <!-- Footer note -->
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
          <p style="color: #9CA3AF; font-size: 12px; margin: 0; line-height: 1.6;">
            This report was automatically generated by EduEase School Management System.
            Please contact the school directly for any questions or concerns.
          </p>
        </div>
      </div>
    `
  })

  res.json({
    message: `Report successfully sent to ${student.parentEmail}`
  })
}

module.exports = { generateReport, sendReport }