const express = require('express')
const router = express.Router()
const { getStudents, getStudentProfile, createStudent, updateStudent, deleteStudent } = require('../controllers/student.controller')
const { protect, requireRole } = require('../middleware/auth.middleware')

router.get('/',      protect, getStudents)
router.get('/:id',  protect, getStudentProfile)
router.post('/',    protect, requireRole('admin'), createStudent)
router.put('/:id',  protect, requireRole('admin'), updateStudent)
router.delete('/:id', protect, requireRole('admin'), deleteStudent)

module.exports = router