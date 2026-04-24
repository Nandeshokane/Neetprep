import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { HiOutlineAcademicCap, HiOutlineBeaker, HiOutlineHeart, HiOutlineLightningBolt, HiOutlineFilter, HiOutlineClock, HiOutlinePlay } from 'react-icons/hi';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState({ years: [], subjects: [], chapters: [] });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [timedMode, setTimedMode] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    // Reload chapters when subject changes
    if (selectedSubject) {
      questionsAPI.getFilters({ subject: selectedSubject })
        .then(res => {
          setFilters(prev => ({ ...prev, chapters: res.data.chapters }));
          setSelectedChapter('');
        })
        .catch(console.error);
    }
  }, [selectedSubject]);

  const loadFilters = async () => {
    try {
      const res = await questionsAPI.getFilters();
      setFilters(res.data);
    } catch (err) {
      console.error('Failed to load filters:', err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    const params = new URLSearchParams();
    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedYear) params.set('year', selectedYear);
    if (selectedChapter) params.set('chapter', selectedChapter);
    params.set('limit', questionCount);
    if (timedMode) params.set('timer', timerMinutes * 60);
    navigate(`/quiz?${params.toString()}`);
  };

  const subjectCards = [
    {
      name: 'Physics',
      icon: HiOutlineLightningBolt,
      color: 'from-indigo-500 to-indigo-700',
      shadow: 'shadow-indigo-500/20',
      bgLight: 'bg-indigo-50 dark:bg-indigo-500/10',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      description: 'Mechanics, Optics, Thermodynamics & more',
    },
    {
      name: 'Chemistry',
      icon: HiOutlineBeaker,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
      bgLight: 'bg-amber-50 dark:bg-amber-500/10',
      textColor: 'text-amber-600 dark:text-amber-400',
      description: 'Organic, Inorganic & Physical Chemistry',
    },
    {
      name: 'Biology',
      icon: HiOutlineHeart,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      bgLight: 'bg-emerald-50 dark:bg-emerald-500/10',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      description: 'Botany, Zoology, Genetics & more',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-transparent to-emerald-600/5 dark:from-primary-600/10 dark:to-emerald-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center max-w-3xl mx-auto animate-slideUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
              <HiOutlineAcademicCap className="w-4 h-4" />
              NEET Previous Year Questions
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-surface-900 dark:text-white tracking-tight leading-tight">
              Master NEET with
              <span className="bg-gradient-to-r from-primary-500 to-emerald-500 bg-clip-text text-transparent"> Smart Practice</span>
            </h1>
            <p className="mt-6 text-lg text-surface-500 dark:text-surface-400 leading-relaxed max-w-2xl mx-auto">
              Practice previous year NEET questions organized by year, subject, and chapter.
              Track your progress, bookmark important questions, and focus on your weak areas.
            </p>
          </div>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {subjectCards.map((subj, i) => (
            <button
              key={subj.name}
              id={`subject-card-${subj.name.toLowerCase()}`}
              onClick={() => {
                setSelectedSubject(subj.name === selectedSubject ? '' : subj.name);
              }}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                selectedSubject === subj.name
                  ? `border-transparent ring-2 ring-offset-2 dark:ring-offset-surface-950 ${subj.name === 'Physics' ? 'ring-indigo-500' : subj.name === 'Chemistry' ? 'ring-amber-500' : 'ring-emerald-500'} ${subj.bgLight}`
                  : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 bg-white dark:bg-surface-900'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subj.color} ${subj.shadow} shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <subj.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">{subj.name}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">{subj.description}</p>
              {selectedSubject === subj.name && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Configuration */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center">
              <HiOutlineFilter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Configure Quiz</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400">Customize your practice session</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Year Select */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Year</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">All Years</option>
                {filters.years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Chapter Select */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Chapter</label>
              <select
                id="chapter-select"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">All Chapters</option>
                {filters.chapters.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Number of Questions
              </label>
              <select
                id="question-count"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                {[5, 10, 15, 20, 25, 50].map(n => (
                  <option key={n} value={n}>{n} questions</option>
                ))}
              </select>
            </div>

            {/* Timer */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Timer
              </label>
              <div className="flex gap-2">
                <button
                  id="timer-toggle"
                  onClick={() => setTimedMode(!timedMode)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    timedMode
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'border-surface-300 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:border-surface-400'
                  }`}
                >
                  <HiOutlineClock className="w-4 h-4" />
                  {timedMode ? 'On' : 'Off'}
                </button>
                {timedMode && (
                  <select
                    id="timer-duration"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(Number(e.target.value))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  >
                    {[5, 10, 15, 20, 30, 45, 60].map(m => (
                      <option key={m} value={m}>{m} minutes</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            id="start-quiz-btn"
            onClick={startQuiz}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold text-base shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <HiOutlinePlay className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Start Practice
          </button>

          {!user && (
            <p className="text-center text-xs text-surface-400 dark:text-surface-500 mt-3">
              Sign in to save your progress and track performance
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
