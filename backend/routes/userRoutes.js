const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  saveProgress,
  getStats,
  toggleBookmark,
  getBookmarks,
  getIncorrect,
  clearIncorrect,
} = require('../controllers/userController');

// All user routes require authentication
router.use(auth);

router.post('/progress', saveProgress);
router.get('/stats', getStats);
router.post('/bookmark/:questionId', toggleBookmark);
router.get('/bookmarks', getBookmarks);
router.get('/incorrect', getIncorrect);
router.post('/incorrect/clear', clearIncorrect);

module.exports = router;
