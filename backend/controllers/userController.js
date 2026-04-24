const User = require('../models/User');

// Save quiz result
exports.saveProgress = async (req, res) => {
  try {
    const { score, total, subject, chapter, timeTaken, incorrectIds } = req.body;
    const user = await User.findById(req.user._id);

    // Update totals
    user.totalAttempted += total;
    user.totalCorrect += score;

    // Add quiz history entry
    user.quizHistory.push({
      score,
      total,
      subject: subject || 'Mixed',
      chapter: chapter || 'Mixed',
      timeTaken: timeTaken || 0,
    });

    // Add incorrect questions (avoid duplicates)
    if (incorrectIds && incorrectIds.length > 0) {
      const existingSet = new Set(user.incorrectQuestions);
      incorrectIds.forEach(id => existingSet.add(id));
      user.incorrectQuestions = Array.from(existingSet);
    }

    await user.save();
    res.json({
      totalAttempted: user.totalAttempted,
      totalCorrect: user.totalCorrect,
      accuracy: user.totalAttempted > 0
        ? ((user.totalCorrect / user.totalAttempted) * 100).toFixed(1)
        : 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user stats
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      totalAttempted: user.totalAttempted,
      totalCorrect: user.totalCorrect,
      accuracy: user.totalAttempted > 0
        ? ((user.totalCorrect / user.totalAttempted) * 100).toFixed(1)
        : 0,
      quizHistory: user.quizHistory.slice(-20), // last 20 quizzes
      incorrectCount: user.incorrectQuestions.length,
      bookmarkCount: user.bookmarks.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const questionId = Number(req.params.questionId);
    const user = await User.findById(req.user._id);

    const index = user.bookmarks.indexOf(questionId);
    if (index === -1) {
      user.bookmarks.push(questionId);
    } else {
      user.bookmarks.splice(index, 1);
    }

    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get incorrect question IDs
exports.getIncorrect = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ incorrectQuestions: user.incorrectQuestions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear incorrect questions (after retry)
exports.clearIncorrect = async (req, res) => {
  try {
    const { questionIds } = req.body;
    const user = await User.findById(req.user._id);

    if (questionIds && questionIds.length > 0) {
      user.incorrectQuestions = user.incorrectQuestions.filter(
        id => !questionIds.includes(id)
      );
    } else {
      user.incorrectQuestions = [];
    }

    await user.save();
    res.json({ incorrectQuestions: user.incorrectQuestions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
