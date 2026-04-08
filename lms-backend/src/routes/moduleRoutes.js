const express = require('express');
const router = express.Router();
const {
  getModules,
  getModulePages,
  createModule,
  updateModule,
  deleteModule,
  addPage,
  updatePage
} = require('../controllers/moduleController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Both roles
router.get('/', authMiddleware, getModules);
router.get('/:id/pages', authMiddleware, getModulePages);

// Teacher only
router.post('/', authMiddleware, roleMiddleware('TEACHER'), createModule);
router.put('/:id', authMiddleware, roleMiddleware('TEACHER'), updateModule);
router.delete('/:id', authMiddleware, roleMiddleware('TEACHER'), deleteModule);
router.post('/:id/pages', authMiddleware, roleMiddleware('TEACHER'), addPage);
router.put('/:id/pages/:pageId', authMiddleware, roleMiddleware('TEACHER'), updatePage);

module.exports = router;