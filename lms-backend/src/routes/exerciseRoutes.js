const express = require('express');
const router = express.Router();
const {
  getExercises,
  getExercise,
  createExercise,
  submitExercise,
  getResults,
  exportResults
} = require('../controllers/exerciseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getExercises);
router.get('/:id', authMiddleware, getExercise);
router.post('/', authMiddleware, roleMiddleware('TEACHER'), createExercise);
router.post('/:id/submit', authMiddleware, submitExercise);
router.get('/:id/results', authMiddleware, roleMiddleware('TEACHER'), getResults);
router.get('/:id/results/export', authMiddleware, roleMiddleware('TEACHER'), exportResults);

module.exports = router;