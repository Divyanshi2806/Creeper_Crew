const express = require('express')
const router = express.Router()
const { getAlerts, markAsRead, markAllAsRead } = require('../controllers/alert.controller')
const { protect } = require('../middleware/auth.middleware')

router.get('/',               protect, getAlerts)
router.patch('/:id/read',     protect, markAsRead)
router.patch('/read-all',     protect, markAllAsRead)

module.exports = router