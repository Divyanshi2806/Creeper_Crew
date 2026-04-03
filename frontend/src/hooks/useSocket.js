// useSocket.js — Connects to Socket.io server and listens for real-time alerts
// Returns the socket instance and any new alerts received

import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'

export function useSocket() {
  const { user } = useAuth()
  const socketRef = useRef(null)           // persists socket across renders
  const [alerts, setAlerts] = useState([])  // latest real-time alert
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!user) return

    // Connect to the backend Socket.io server
    socketRef.current = io(
      import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
      { withCredentials: true }
    )

    const socket = socketRef.current

    socket.on('connect', () => {
      setConnected(true)
      // Join this teacher's personal room so we receive their alerts
      if (user.role === 'teacher') {
        socket.emit('join_teacher_room', user.id)
      }
    })

    socket.on('disconnect', () => setConnected(false))

    // Listen for new alert events emitted by the backend
    socket.on('new_alert', (alert) => {
      setAlerts((prev) => [alert, ...prev])
      })

    // Cleanup: disconnect when component unmounts or user logs out
    return () => {
      socket.disconnect()
    }
  }, [user])

  return { socket: socketRef.current, alerts, connected }
}