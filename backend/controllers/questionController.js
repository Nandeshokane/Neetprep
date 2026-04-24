const Question = require('../models/Question');

// Get questions with filters
exports.getQuestions = async (req, res) => {
  try {
    const { year, subject, chapter, difficulty, limit, page } = req.query;
    const filter = {};

    if (year) filter.year = Number(year);
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (difficulty) filter.difficulty = difficulty;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [questions, total] = await Promise.all([
      Question.find(filter).skip(skip).limit(limitNum).lean(),
      Question.countDocuments(filter),
    ]);

    res.json({
      questions,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single question by id
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({ id: Number(req.params.id) }).lean();
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get available filter options (years, subjects, chapters)
exports.getFilters = async (req, res) => {
  try {
    const { subject } = req.query;
    const matchStage = subject ? { subject } : {};

    const [years, subjects, chapters] = await Promise.all([
      Question.distinct('year', matchStage),
      Question.distinct('subject'),
      Question.distinct('chapter', matchStage),
    ]);

    res.json({
      years: years.sort((a, b) => b - a),
      subjects: subjects.sort(),
      chapters: chapters.sort(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get questions by IDs (for bookmarks / incorrect retry)
exports.getQuestionsByIds = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'ids array is required' });
    }
    const questions = await Question.find({ id: { $in: ids } }).lean();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
