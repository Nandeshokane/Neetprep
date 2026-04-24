const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestion,
  getFilters,
  getQuestionsByIds,
} = require('../controllers/questionController');

router.get('/', getQuestions);
router.get('/filters', getFilters);
router.post('/by-ids', getQuestionsByIds);
router.get('/:id', getQuestion);

module.exports = router;
