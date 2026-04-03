const express = require('express')
const router = express.Router()
const { getTimetable, updateTimetableSlot } = require('../controllers/timetable.controller')
const { protect, requireRole } = require('../middleware/auth.middleware')

router.get('/',      protect, getTimetable)
router.put('/:id',   protect, requireRole('admin'), updateTimetableSlot)

module.exports = router