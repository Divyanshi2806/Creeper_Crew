// useStudentProfile.js — Fetches complete student data for the profile page

import { useState, useEffect } from 'react'
import api from '@/utils/api'

export function useStudentProfile(studentId) {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!studentId) return
    fetchProfile()
  }, [studentId])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/students/${studentId}`)
      setStudent(res.data.student)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load student profile.')
    } finally {
      setLoading(false)
    }
  }

  return { student, loading, error, refetch: fetchProfile }
}