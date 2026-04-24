import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { questionsAPI, userAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState({});
  const [bookmarks, setBookmarks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);
  const [startTime] = useState(Date.now());

  // Timer
  const timerDuration = Number(searchParams.get('timer')) || 0;
  const [timerRunning, setTimerRunning] = useState(timerDuration > 0);

  useEffect(() => {
    loadQuestions();
    if (user) loadBookmarks();
  }, []);

  const loadQuestions = async () => {
    try {
      const params = {};
      const subject = searchParams.get('subject');
      const year = searchParams.get('year');
      const chapter = searchParams.get('chapter');
      const limit = searchParams.get('limit');

      if (subject) params.subject = subject;
      if (year) params.year = year;
      if (chapter) params.chapter = chapter;
      if (limit) params.limit = limit;

      const res = await questionsAPI.getAll(params);
      setQuestions(res.data.questions);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const res = await userAPI.getBookmarks();
      setBookmarks(new Set(res.data.bookmarks));
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    }
  };

  const handleSelectAnswer = (answerIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: answerIndex }));
    // Auto-show result after selecting
    setTimeout(() => {
      setShowResults(prev => ({ ...prev, [currentIndex]: true }));
    }, 300);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleToggleBookmark = async (questionId) => {
    if (!user) return;
    try {
      const res = await userAPI.toggleBookmark(questionId);
      setBookmarks(new Set(res.data.bookmarks));
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleTimeUp = useCallback(() => {
    setTimerRunning(false);
    finishQuiz();
  }, []);

  const finishQuiz = async () => {
    setQuizComplete(true);
    setTimerRunning(false);

    if (user) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const score = getScore();
      const incorrectIds = questions
        .filter((q, i) => selectedAnswers[i] !== undefined && selectedAnswers[i] !== q.correctAnswer)
        .map(q => q.id);

      try {
        await userAPI.saveProgress({
          score,
          total: questions.length,
          subject: searchParams.get('subject') || 'Mixed',
          chapter: searchParams.get('chapter') || 'Mixed',
          timeTaken,
          incorrectIds,
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }
  };

  const getScore = () => {
    return questions.reduce((score, q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) return score + 1;
      return score;
    }, 0);
  };

  const getAnsweredCount = () => {
    return Object.keys(selectedAnswers).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-500 dark:text-surface-400 text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <HiOutlineX className="w-8 h-8 text-surface-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">No Questions Found</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">Try adjusting your filters to find questions.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Quiz Complete Screen
  if (quizComplete) {
    const score = getScore();
    const total = questions.length;
    const percentage = ((score / total) * 100).toFixed(1);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-slideUp">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-8 text-center shadow-sm">
          {/* Score Circle */}
          <div className="relative w-36 h-36 mx-auto mb-6">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="64" fill="none" stroke="currentColor" strokeWidth="8"
                className="text-surface-100 dark:text-surface-800" />
              <circle cx="72" cy="72" r="64" fill="none" stroke="currentColor" strokeWidth="8"
                strokeDasharray={`${(score / total) * 402} 402`}
                strokeLinecap="round"
                className={percentage >= 70 ? 'text-correct' : percentage >= 40 ? 'text-chemistry' : 'text-incorrect'}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-surface-900 dark:text-white">{score}</span>
              <span className="text-sm text-surface-400">of {total}</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
            {percentage >= 70 ? '🎉 Excellent!' : percentage >= 40 ? '👍 Good Effort!' : '💪 Keep Practicing!'}
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">
            You scored {percentage}% accuracy in {minutes}m {seconds}s
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-correct-bg">
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{score}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Correct</div>
            </div>
            <div className="p-4 rounded-xl bg-incorrect-bg">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{total - score}</div>
              <div className="text-xs text-red-600 dark:text-red-500 font-medium">Incorrect</div>
            </div>
            <div className="p-4 rounded-xl bg-surface-100 dark:bg-surface-800">
              <div className="text-2xl font-bold text-surface-700 dark:text-surface-300">{total - getAnsweredCount()}</div>
              <div className="text-xs text-surface-500 font-medium">Skipped</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="retry-quiz-btn"
              onClick={() => window.location.reload()}
              className="flex-1 py-3 rounded-xl border-2 border-primary-600 text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
            >
              Retry Quiz
            </button>
            <button
              id="back-home-btn"
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg shadow-primary-600/25 transition-all"
            >
              New Quiz
            </button>
            {user && (
              <button
                id="view-dashboard-btn"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 font-semibold transition-colors"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz
  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="quiz-back-btn"
          onClick={() => {
            if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
              navigate('/');
            }
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Exit
        </button>

        {timerDuration > 0 && (
          <Timer duration={timerDuration} onTimeUp={handleTimeUp} isRunning={timerRunning} />
        )}

        <div className="text-sm font-medium text-surface-500 dark:text-surface-400">
          {getAnsweredCount()}/{questions.length} answered
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-surface-100 dark:bg-surface-800 mb-8 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 md:p-8 shadow-sm">
        <QuestionCard
          question={currentQuestion}
          index={currentIndex}
          total={questions.length}
          selectedAnswer={selectedAnswers[currentIndex]}
          onSelectAnswer={handleSelectAnswer}
          showResult={showResults[currentIndex] || false}
          isBookmarked={bookmarks.has(currentQuestion.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          id="prev-question-btn"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-surface-600 dark:text-surface-400 font-medium text-sm hover:bg-surface-50 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Question Dots */}
        <div className="hidden sm:flex items-center gap-1.5 flex-wrap max-w-md justify-center">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? 'bg-primary-500 scale-125'
                  : selectedAnswers[i] !== undefined
                  ? showResults[i] && selectedAnswers[i] === questions[i].correctAnswer
                    ? 'bg-correct'
                    : showResults[i]
                    ? 'bg-incorrect'
                    : 'bg-primary-300 dark:bg-primary-700'
                  : 'bg-surface-200 dark:bg-surface-700'
              }`}
            />
          ))}
        </div>

        <button
          id="next-question-btn"
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 transition-all"
        >
          {currentIndex === questions.length - 1 ? (
            <>
              Finish <HiOutlineCheck className="w-4 h-4" />
            </>
          ) : (
            <>
              Next <HiOutlineArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
