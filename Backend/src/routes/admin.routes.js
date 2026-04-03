const express = require('express')
const router = express.Router()
const { protect, requireRole } = require('../middleware/auth.middleware')

const adminController = require('../controllers/admin.controller')

router.get('/dashboard', protect, requireRole('admin'), adminController.getAdminDashboard)

module.exports = router