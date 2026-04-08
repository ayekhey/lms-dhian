const express = require('express');
const router = express.Router();
const {
  getStudents,
  createStudent,
  resetPassword,
  resetDiagnostic,
  deleteStudent
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/students', authMiddleware, roleMiddleware('TEACHER'), getStudents);
router.post('/students', authMiddleware, roleMiddleware('TEACHER'), createStudent);
router.put('/students/:id/reset-password', authMiddleware, roleMiddleware('TEACHER'), resetPassword);
router.put('/students/:id/reset-diagnostic', authMiddleware, roleMiddleware('TEACHER'), resetDiagnostic);
router.delete('/students/:id', authMiddleware, roleMiddleware('TEACHER'), deleteStudent);

module.exports = router;