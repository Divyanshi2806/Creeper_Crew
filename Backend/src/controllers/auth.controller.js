// auth.controller.js — Handles login for teachers and admins

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Helper: create a signed JWT token
function generateToken(id, email, role) {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password, role } = req.body

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password and role are required.' })
  }
  if (!['teacher', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "teacher" or "admin".' })
  }

  let user
  if (role === 'teacher') {
    user = await prisma.teacher.findUnique({ where: { email } })
  } else {
    user = await prisma.admin.findUnique({ where: { email } })
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const token = generateToken(user.id, user.email, role)
  const { password: _, ...userWithoutPassword } = user

  res.json({
    message: 'Login successful',
    token,
    user: { ...userWithoutPassword, role }
  })
}

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user })
}

module.exports = { login, getMe }