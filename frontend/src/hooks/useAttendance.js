// useAttendance.js — All attendance data fetching and saving logic
// Keeps the page component clean by handling API calls here

import { useState, useEffect } from 'react'
import api from '@/utils/api'

export function useAttendance(classId, date) {
  const [students, setStudents] = useState([])   // students + their status for today
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [saved,    setSaved]    = useState(false) // shows success message

  // Fetch students + today's attendance whenever classId or date changes
  useEffect(() => {
    if (!classId || !date) return
    fetchAttendance()
  }, [classId, date])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      setError('')
      setSaved(false)

      // GET /api/attendance?classId=1&date=2024-06-03
      const res = await api.get('/attendance', { params: { classId, date } })

      // If student has no record yet, default to 'present'
      const withDefaults = res.data.students.map(s => ({
        ...s,
        status: s.status || 'present'
      }))
      setStudents(withDefaults)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load attendance.')
    } finally {
      setLoading(false)
    }
  }

  // Update a single student's status locally (before saving)
  const updateStatus = (studentId, status) => {
    setStudents(prev =>
      prev.map(s => s.id === studentId ? { ...s, status } : s)
    )
    setSaved(false) // reset saved state when changes are made
  }

  // Mark all students as present at once
  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'present' })))
    setSaved(false)
  }

  // Save all attendance records to the database
  const saveAttendance = async () => {
    try {
      setSaving(true)
      setError('')

      const records = students.map(s => ({
        studentId: s.id,
        status: s.status,
      }))

      await api.post('/attendance', { classId, date, records })
      setSaved(true)

      // Hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save attendance.')
    } finally {
      setSaving(false)
    }
  }

  return {
    students, loading, saving, error, saved,
    updateStatus, markAllPresent, saveAttendance, refetch: fetchAttendance
  }
}