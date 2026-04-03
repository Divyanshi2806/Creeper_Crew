const express = require('express')
const router = express.Router()
const { getDashboard, getTeacherWorkload } = require('../controllers/teacher.controller')
const { protect, requireRole } = require('../middleware/auth.middleware')

router.get('/dashboard', protect, requireRole('teacher'), getDashboard)
router.get('/:id/workload', protect, requireRole('admin'), getTeacherWorkload)

module.exports = router