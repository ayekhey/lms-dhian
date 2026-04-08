const express = require('express');
const router = express.Router();
const { getMedia, uploadMedia, deleteMedia } = require('../controllers/mediaController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

router.get('/', authMiddleware, getMedia);
router.post('/', authMiddleware, roleMiddleware('TEACHER'), upload.single('image'), uploadMedia);
router.delete('/:id', authMiddleware, roleMiddleware('TEACHER'), deleteMedia);

module.exports = router;