import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, questionsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineChartBar,
  HiOutlineBookmark,
  HiOutlineRefresh,
  HiOutlineTrendingUp,
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlineCalendar,
  HiOutlinePlay,
} from 'react-icons/hi';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      const [statsRes, bookmarksRes, incorrectRes] = await Promise.all([
        userAPI.getStats(),
        userAPI.getBookmarks(),
        userAPI.getIncorrect(),
      ]);

      setStats(statsRes.data);

      // Fetch bookmarked questions details
      if (bookmarksRes.data.bookmarks.length > 0) {
        const qRes = await questionsAPI.getByIds(bookmarksRes.data.bookmarks);
        setBookmarkedQuestions(qRes.data);
      }

      // Fetch incorrect questions details
      if (incorrectRes.data.incorrectQuestions.length > 0) {
        const qRes = await questionsAPI.getByIds(incorrectRes.data.incorrectQuestions);
        setIncorrectQuestions(qRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const retryIncorrect = () => {
    if (incorrectQuestions.length === 0) return;
    const ids = incorrectQuestions.map(q => q.id).join(',');
    navigate(`/quiz?ids=${ids}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HiOutlineChartBar },
    { id: 'bookmarks', label: 'Bookmarks', icon: HiOutlineBookmark, count: bookmarkedQuestions.length },
    { id: 'incorrect', label: 'Incorrect', icon: HiOutlineRefresh, count: incorrectQuestions.length },
    { id: 'history', label: 'History', icon: HiOutlineCalendar, count: stats?.quizHistory?.length || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
          Welcome back, <span className="bg-gradient-to-r from-primary-500 to-emerald-500 bg-clip-text text-transparent">{user?.username}</span>
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Track your NEET preparation progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={HiOutlineAcademicCap}
          label="Total Attempted"
          value={stats?.totalAttempted || 0}
          color="from-primary-500 to-primary-600"
          shadow="shadow-primary-500/20"
        />
        <StatCard
          icon={HiOutlineTrendingUp}
          label="Accuracy"
          value={`${stats?.accuracy || 0}%`}
          color="from-emerald-500 to-teal-600"
          shadow="shadow-emerald-500/20"
        />
        <StatCard
          icon={HiOutlineBookmark}
          label="Bookmarked"
          value={stats?.bookmarkCount || 0}
          color="from-amber-500 to-orange-600"
          shadow="shadow-amber-500/20"
        />
        <StatCard
          icon={HiOutlineLightningBolt}
          label="To Review"
          value={stats?.incorrectCount || 0}
          color="from-rose-500 to-pink-600"
          shadow="shadow-rose-500/20"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-100 dark:bg-surface-800/50 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                activeTab === tab.id
                  ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400'
                  : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} navigate={navigate} />
        )}
        {activeTab === 'bookmarks' && (
          <QuestionList
            questions={bookmarkedQuestions}
            emptyMessage="No bookmarked questions yet. Bookmark questions during quizzes to review them later."
            emptyIcon="📑"
          />
        )}
        {activeTab === 'incorrect' && (
          <div>
            {incorrectQuestions.length > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  id="retry-incorrect-btn"
                  onClick={retryIncorrect}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-lg shadow-primary-600/20 transition-all"
                >
                  <HiOutlinePlay className="w-4 h-4" />
                  Retry All Incorrect
                </button>
              </div>
            )}
            <QuestionList
              questions={incorrectQuestions}
              emptyMessage="No incorrect questions! Great job — keep up the good work."
              emptyIcon="🎯"
            />
          </div>
        )}
        {activeTab === 'history' && (
          <HistoryTab quizHistory={stats?.quizHistory || []} />
        )}
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ icon: Icon, label, value, color, shadow }) {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 shadow-sm">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} ${shadow} shadow-lg flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold text-surface-900 dark:text-white">{value}</div>
      <div className="text-xs font-medium text-surface-500 dark:text-surface-400 mt-0.5">{label}</div>
    </div>
  );
}

function OverviewTab({ stats, navigate }) {
  const history = stats?.quizHistory || [];
  const recentQuizzes = history.slice(-5).reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Summary */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Performance Summary</h3>
        <div className="space-y-4">
          <ProgressBar label="Correct" value={stats?.totalCorrect || 0} max={stats?.totalAttempted || 1} color="bg-correct" />
          <ProgressBar label="Incorrect" value={(stats?.totalAttempted || 0) - (stats?.totalCorrect || 0)} max={stats?.totalAttempted || 1} color="bg-incorrect" />
        </div>
      </div>

      {/* Recent Quizzes */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Recent Quizzes</h3>
        {recentQuizzes.length === 0 ? (
          <p className="text-sm text-surface-400 dark:text-surface-500">No quizzes taken yet. Start practicing!</p>
        ) : (
          <div className="space-y-3">
            {recentQuizzes.map((quiz, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800 last:border-0">
                <div>
                  <div className="text-sm font-medium text-surface-700 dark:text-surface-300">{quiz.subject}</div>
                  <div className="text-xs text-surface-400">{new Date(quiz.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-surface-900 dark:text-white">{quiz.score}/{quiz.total}</div>
                  <div className={`text-xs font-medium ${((quiz.score / quiz.total) * 100) >= 70 ? 'text-correct' : 'text-incorrect'}`}>
                    {((quiz.score / quiz.total) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="lg:col-span-2 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/?subject=Physics')}
            className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all text-left"
          >
            <div className="text-sm font-semibold text-surface-900 dark:text-white">Physics Quiz</div>
            <div className="text-xs text-surface-400 mt-0.5">Practice physics questions</div>
          </button>
          <button
            onClick={() => navigate('/?subject=Chemistry')}
            className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-all text-left"
          >
            <div className="text-sm font-semibold text-surface-900 dark:text-white">Chemistry Quiz</div>
            <div className="text-xs text-surface-400 mt-0.5">Practice chemistry questions</div>
          </button>
          <button
            onClick={() => navigate('/?subject=Biology')}
            className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all text-left"
          >
            <div className="text-sm font-semibold text-surface-900 dark:text-white">Biology Quiz</div>
            <div className="text-xs text-surface-400 mt-0.5">Practice biology questions</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, color }) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-surface-600 dark:text-surface-400">{label}</span>
        <span className="text-sm font-semibold text-surface-900 dark:text-white">{value}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-surface-100 dark:bg-surface-800">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function QuestionList({ questions, emptyMessage, emptyIcon }) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">{emptyIcon}</div>
        <p className="text-surface-500 dark:text-surface-400 text-sm max-w-md mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  const subjectColor = {
    Physics: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
    Chemistry: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    Biology: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  };

  return (
    <div className="space-y-3">
      {questions.map(q => (
        <div key={q.id} className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4 hover:border-surface-300 dark:hover:border-surface-700 transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${subjectColor[q.subject]}`}>{q.subject}</span>
                <span className="text-xs text-surface-400">{q.chapter} · {q.year}</span>
              </div>
              <p className="text-sm text-surface-700 dark:text-surface-300 line-clamp-2">{q.question}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryTab({ quizHistory }) {
  if (quizHistory.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-surface-500 dark:text-surface-400 text-sm">No quiz history yet. Start a quiz to see your progress!</p>
      </div>
    );
  }

  const reversed = [...quizHistory].reverse();

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50 dark:bg-surface-800">
              <th className="text-left px-4 py-3 font-semibold text-surface-600 dark:text-surface-400">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-surface-600 dark:text-surface-400">Subject</th>
              <th className="text-left px-4 py-3 font-semibold text-surface-600 dark:text-surface-400">Chapter</th>
              <th className="text-center px-4 py-3 font-semibold text-surface-600 dark:text-surface-400">Score</th>
              <th className="text-center px-4 py-3 font-semibold text-surface-600 dark:text-surface-400">Accuracy</th>
              <th className="text-center px-4 py-3 font-semibold text-surface-600 dark:text-surface-400">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {reversed.map((quiz, i) => {
              const accuracy = ((quiz.score / quiz.total) * 100).toFixed(0);
              const mins = Math.floor((quiz.timeTaken || 0) / 60);
              const secs = (quiz.timeTaken || 0) % 60;
              return (
                <tr key={i} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="px-4 py-3 text-surface-700 dark:text-surface-300">
                    {new Date(quiz.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-surface-700 dark:text-surface-300">{quiz.subject}</td>
                  <td className="px-4 py-3 text-surface-500 dark:text-surface-400">{quiz.chapter || '—'}</td>
                  <td className="px-4 py-3 text-center font-semibold text-surface-900 dark:text-white">
                    {quiz.score}/{quiz.total}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      accuracy >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : accuracy >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {accuracy}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-surface-500 dark:text-surface-400">
                    {mins}m {secs}s
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
