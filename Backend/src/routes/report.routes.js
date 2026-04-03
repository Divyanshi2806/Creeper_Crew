const express = require('express')
const router = express.Router()
const { generateReport, sendReport } = require('../controllers/report.controller')
const { protect } = require('../middleware/auth.middleware')

router.post('/generate', protect, generateReport)
router.post('/send',     protect, sendReport)

module.exports = router