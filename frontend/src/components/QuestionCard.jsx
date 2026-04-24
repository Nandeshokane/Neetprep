import { useState } from 'react';
import { HiOutlineBookmark, HiBookmark, HiOutlineExternalLink, HiChevronDown, HiChevronUp } from 'react-icons/hi';

export default function QuestionCard({
  question,
  index,
  total,
  selectedAnswer,
  onSelectAnswer,
  showResult,
  isBookmarked,
  onToggleBookmark,
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  const getOptionStyle = (optionIndex) => {
    const base = 'option-btn w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 font-medium text-sm';

    if (!showResult) {
      if (selectedAnswer === optionIndex) {
        return `${base} border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20`;
      }
      return `${base} border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800/50`;
    }

    // Show result mode
    if (optionIndex === question.correctAnswer) {
      return `${base} border-correct bg-correct-bg text-emerald-800 dark:text-emerald-300`;
    }
    if (selectedAnswer === optionIndex && optionIndex !== question.correctAnswer) {
      return `${base} border-incorrect bg-incorrect-bg text-red-800 dark:text-red-300`;
    }
    return `${base} border-surface-200 dark:border-surface-700 text-surface-400 dark:text-surface-600 opacity-60`;
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  const subjectColor = {
    Physics: 'bg-physics/10 text-physics dark:bg-physics/20',
    Chemistry: 'bg-chemistry/10 text-chemistry dark:bg-chemistry/20',
    Biology: 'bg-biology/10 text-biology dark:bg-biology/20',
  };

  const difficultyColor = {
    Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    Hard: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${subjectColor[question.subject]}`}>
            {question.subject}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor[question.difficulty]}`}>
            {question.difficulty}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400">
            {question.year}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400">
            {question.chapter}
          </span>
        </div>
        <button
          id={`bookmark-btn-${question.id}`}
          onClick={() => onToggleBookmark(question.id)}
          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
        >
          {isBookmarked ? (
            <HiBookmark className="w-5 h-5 text-primary-500" />
          ) : (
            <HiOutlineBookmark className="w-5 h-5 text-surface-400 hover:text-primary-500 transition-colors" />
          )}
        </button>
      </div>

      {/* Question Counter */}
      <div className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-3">
        Question {index + 1} of {total}
      </div>

      {/* Question Text */}
      <h2 className="text-lg md:text-xl font-semibold text-surface-900 dark:text-white leading-relaxed mb-8">
        {question.question}
      </h2>

      {/* Options */}
      <div className="grid gap-3 mb-6">
        {question.options.map((option, i) => (
          <button
            key={i}
            id={`option-${i}`}
            onClick={() => !showResult && onSelectAnswer(i)}
            disabled={showResult}
            className={getOptionStyle(i)}
          >
            <div className="flex items-center gap-4">
              <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                showResult && i === question.correctAnswer
                  ? 'bg-correct text-white'
                  : showResult && selectedAnswer === i && i !== question.correctAnswer
                  ? 'bg-incorrect text-white'
                  : selectedAnswer === i
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400'
              }`}>
                {optionLabels[i]}
              </span>
              <span>{option}</span>
            </div>
            {showResult && i === question.correctAnswer && (
              <span className="mt-1 ml-12 text-xs font-medium text-correct">✓ Correct Answer</span>
            )}
            {showResult && selectedAnswer === i && i !== question.correctAnswer && (
              <span className="mt-1 ml-12 text-xs font-medium text-incorrect">✗ Your Answer</span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation (shown after answering) */}
      {showResult && (
        <div className="animate-fadeIn">
          <button
            id="toggle-explanation"
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors text-sm font-medium w-full"
          >
            {showExplanation ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
          </button>

          {showExplanation && (
            <div className="mt-3 p-5 rounded-xl bg-primary-50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/10 animate-fadeIn">
              <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                {question.explanation || 'No explanation available for this question.'}
              </p>
              {question.explanationLink && (
                <a
                  href={question.explanationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Learn More <HiOutlineExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
