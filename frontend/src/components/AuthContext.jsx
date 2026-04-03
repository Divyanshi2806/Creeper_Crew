// AuthContext.jsx — Global authentication state
// Wraps the entire app so any component can access the logged-in user

import { createContext, useContext, useState, useEffect } from 'react'

// Create the context object
const AuthContext = createContext(null)

// AuthProvider wraps the whole app in main.jsx
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)   // logged-in user object
  const [token, setToken]     = useState(null)   // JWT token string
  const [loading, setLoading] = useState(true)   // true while checking localStorage

  // On first load, check if user was already logged in (token in localStorage)
  useEffect(() => {
    const savedToken = localStorage.getItem('eduease_token')
    const savedUser  = localStorage.getItem('eduease_user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false) // done checking
  }, [])

  // Called after successful login
  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    // Persist to localStorage so refresh doesn't log them out
    localStorage.setItem('eduease_token', jwtToken)
    localStorage.setItem('eduease_user', JSON.stringify(userData))
  }

  // Called when user clicks logout
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('eduease_token')
    localStorage.removeItem('eduease_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this in any component: const { user } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}