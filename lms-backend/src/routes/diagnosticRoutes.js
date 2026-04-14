const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionsForTeacher,
  createQuestion,
  deleteQuestion,
  submitDiagnostic,
  getConfig,
  setConfig
} = require('../controllers/diagnosticController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Student routes
router.get('/questions', authMiddleware, getQuestions);
router.post('/submit', authMiddleware, submitDiagnostic);
router.get('/config', authMiddleware, getConfig);

// Teacher routes
router.get('/manage', authMiddleware, roleMiddleware('TEACHER'), getQuestionsForTeacher);
router.post('/questions', authMiddleware, roleMiddleware('TEACHER'), createQuestion);
router.delete('/questions/:id', authMiddleware, roleMiddleware('TEACHER'), deleteQuestion);
router.put('/config', authMiddleware, roleMiddleware('TEACHER'), setConfig);

module.exports = router;
router.get('/results', authMiddleware, roleMiddleware('TEACHER'), getResults);