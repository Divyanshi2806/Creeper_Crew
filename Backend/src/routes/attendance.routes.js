const express = require('express')
const router = express.Router()
const { getAttendance, saveAttendance, getAttendanceSummary } = require('../controllers/attendance.controller')
const { protect } = require('../middleware/auth.middleware')

router.get('/',         protect, getAttendance)
router.post('/',        protect, saveAttendance)
router.get('/summary',  protect, getAttendanceSummary)

module.exports = router