const express = require('express');
const router = express.Router();
const {
  getQuestions,
  submitPostTest,
  getStatus,
  getResults,
  getConfig,
  setConfig,
} = require('../controllers/postTestController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/questions', authMiddleware, getQuestions);
router.post('/submit', authMiddleware, submitPostTest);
router.get('/status', authMiddleware, getStatus);
router.get('/config', authMiddleware, getConfig);
router.get('/results', authMiddleware, roleMiddleware('TEACHER'), getResults);
router.put('/config', authMiddleware, roleMiddleware('TEACHER'), setConfig);
router.get('/my-result', authMiddleware, getMyResult);

module.exports = router;