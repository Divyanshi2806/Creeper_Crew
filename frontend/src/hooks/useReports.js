// useReports.js — All data fetching for the AI Reports page

import { useState, useEffect } from 'react'
import api from '@/utils/api'

export function useReports() {
  // List of all students (for the dropdown selector)
  const [students, setStudents] = useState([])
  const [classes,  setClasses]  = useState([])
  const [loadingStudents, setLoadingStudents] = useState(true)

  // The generated report text
  const [report,          setReport]          = useState('')
  const [reportStudent,   setReportStudent]   = useState(null) // student the report is for
  const [generating,      setGenerating]      = useState(false)
  const [generateError,   setGenerateError]   = useState('')

  // Email sending state
  const [sending,     setSending]     = useState(false)
  const [sendSuccess, setSendSuccess] = useState('')
  const [sendError,   setSendError]   = useState('')

  // ── Load teacher's classes + students on mount ────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get teacher's dashboard to find their classes
        const dashRes = await api.get('/teachers/dashboard')
        const cls     = dashRes.data.classes || []
        setClasses(cls)

        // Load students from all classes
        if (cls.length > 0) {
          const allStudents = []
          for (const c of cls) {
            const sRes = await api.get('/students', { params: { classId: c.id } })
            allStudents.push(...(sRes.data.students || []))
          }
          setStudents(allStudents)
        }
      } catch (err) {
        console.error('Failed to load students:', err)
      } finally {
        setLoadingStudents(false)
      }
    }
    loadData()
  }, [])

  // ── Generate a report for a selected student ──────────────
  const generateReport = async (studentId, teacherNotes) => {
    if (!studentId) {
      setGenerateError('Please select a student first.')
      return
    }

    try {
      setGenerating(true)
      setGenerateError('')
      setReport('')
      setSendSuccess('')

      // POST /api/reports/generate
      const res = await api.post('/reports/generate', { studentId, teacherNotes })
      setReport(res.data.report)
      setReportStudent(res.data.student)

    } catch (err) {
      setGenerateError(
        err.response?.data?.error || 'Failed to generate report. Check your Groq API key.'
      )
    } finally {
      setGenerating(false)
    }
  }

  // ── Send the approved report to parent via email ──────────
  const sendReport = async (studentId, reportText) => {
    try {
      setSending(true)
      setSendError('')
      setSendSuccess('')

      // POST /api/reports/send
      const res = await api.post('/reports/send', { studentId, reportText })
      setSendSuccess(res.data.message)

    } catch (err) {
      setSendError(
        err.response?.data?.error || 'Failed to send email. Check your email settings in .env'
      )
    } finally {
      setSending(false)
    }
  }

  // Clear report when starting fresh
  const clearReport = () => {
    setReport('')
    setReportStudent(null)
    setGenerateError('')
    setSendSuccess('')
    setSendError('')
  }

  return {
    students, classes, loadingStudents,
    report, reportStudent, generating, generateError,
    sending, sendSuccess, sendError,
    generateReport, sendReport, clearReport,
  }
}