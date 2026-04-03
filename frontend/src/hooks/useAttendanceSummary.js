// useAttendanceSummary.js — Fetches 30-day attendance percentage per student

import { useState, useEffect } from 'react'
import api from '@/utils/api'

export function useAttendanceSummary(classId) {
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!classId) return
    fetchSummary()
  }, [classId])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      setError('')
      // GET /api/attendance/summary?classId=1
      const res = await api.get('/attendance/summary', { params: { classId } })
      setSummary(res.data.summary)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load summary.')
    } finally {
      setLoading(false)
    }
  }

  return { summary, loading, error, refetch: fetchSummary }
}