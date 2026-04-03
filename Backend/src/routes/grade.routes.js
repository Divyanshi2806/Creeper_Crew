const express = require('express')
const router = express.Router()
const { getGrades, saveGrades, getHeatmap, getStudentGrades } = require('../controllers/grade.controller')
const { protect } = require('../middleware/auth.middleware')

router.get('/',              getGrades)
router.post('/',             saveGrades)
router.get('/heatmap',       getHeatmap)
router.get('/student/:id',   getStudentGrades)

module.exports = router