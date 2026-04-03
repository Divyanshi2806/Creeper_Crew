const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please log in.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role === 'teacher') {
      const teacher = await prisma.teacher.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, subject: true } // never return password
      })
      if (!teacher) return res.status(401).json({ error: 'Teacher not found.' })
      req.user = { ...teacher, role: 'teacher' }

    } else if (decoded.role === 'admin') {
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true }
      })
      if (!admin) return res.status(401).json({ error: 'Admin not found.' })
      req.user = { ...admin, role: 'admin' }

    } else {
      return res.status(401).json({ error: 'Invalid role in token.' })
    }

    next()

  } catch (err) {
    next(err)
  }
}

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`
      })
    }
    next()
  }
}

module.exports = { protect, requireRole }