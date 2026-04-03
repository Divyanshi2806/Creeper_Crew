// useDashboard.js — Fetches all teacher dashboard data in one call
// Separates data-fetching logic from the UI component

import { useState, useEffect } from 'react'
import api from '@/utils/api'

export function useDashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/teachers/dashboard')
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  return { data, loading, error, refetch: fetchDashboard }
}