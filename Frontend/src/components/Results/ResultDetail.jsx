import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resultAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { ArrowLeft, Clock, Target, Award, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

const ResultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await resultAPI.getById(id);
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load result');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreInfo = (percentage) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' };
    if (percentage >= 70) return { label: 'Good', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20', border: 'border-primary-200 dark:border-primary-800' };
    if (percentage >= 50) return { label: 'Average', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' };
    return { label: 'Needs Practice', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
          <p className="text-sm text-red-700 dark:text-red-400">{error || 'Result not found'}</p>
        </div>
      </div>
    );
  }

  const scoreInfo = getScoreInfo(result.percentage);

  // SVG Circular Progress calculation
  const circleRadius = 60;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (result.percentage / 100) * circleCircumference;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/results')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {result.quiz?.title || 'Quiz Result'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Detailed performance review and question breakdown.</p>
      </div>

      {/* Hero Summary Card */}
      <div className={`rounded-3xl shadow-soft-xl border ${scoreInfo.border} ${scoreInfo.bg} p-8 md:p-10 mb-8 overflow-hidden relative`}>
        {/* Background Decorative element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/20 dark:bg-black/10 blur-3xl mix-blend-overlay"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          
          {/* Circular Progress */}
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                className="text-white/30 dark:text-black/20"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
                r={circleRadius}
                cx="80"
                cy="80"
              />
              <circle
                className={scoreInfo.color}
                strokeWidth="12"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={circleRadius}
                cx="80"
                cy="80"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-bold ${scoreInfo.color}`}>{result.percentage.toFixed(0)}%</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-white/20 dark:border-gray-700/30 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className={`w-5 h-5 ${scoreInfo.color}`} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Score</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.score} <span className="text-base font-medium text-gray-500">/ {result.total}</span>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-white/20 dark:border-gray-700/30 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-5 h-5 ${scoreInfo.color}`} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(result.timeTaken)}
              </div>
            </div>

            <div className="col-span-2 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-white/20 dark:border-gray-700/30 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${scoreInfo.bg}`}>
                  <Award className={`w-6 h-6 ${scoreInfo.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Final Grade</p>
                  <p className={`text-xl font-bold ${scoreInfo.color}`}>{scoreInfo.label}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Breakdown */}
      {result.questionBreakdown && result.questionBreakdown.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Question Breakdown</h2>
          <div className="space-y-4">
            {result.questionBreakdown.map((q, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border ${
                  q.isCorrect
                    ? 'border-emerald-100 dark:border-emerald-900/30'
                    : 'border-rose-100 dark:border-rose-900/30'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex-shrink-0 mt-1`}>
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      <span className="text-gray-400 dark:text-gray-500 mr-2">{q.questionNumber}.</span>
                      {q.question}
                    </h3>
                  </div>
                </div>

                <div className="ml-10 space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                    <div className="text-sm mb-1 text-gray-500 dark:text-gray-400">Your Answer</div>
                    <div className={`font-medium ${q.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {q.options[q.userAnswer] || 'Not answered'}
                    </div>
                  </div>

                  {!q.isCorrect && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100/50 dark:border-emerald-900/30">
                      <div className="text-sm mb-1 text-emerald-600/70 dark:text-emerald-400/70 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Correct Answer
                      </div>
                      <div className="font-medium text-emerald-700 dark:text-emerald-300">
                        {q.options[q.correctAnswer]}
                      </div>
                    </div>
                  )}

                  {q.explanation && (
                    <div className="flex gap-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100/50 dark:border-blue-900/30 mt-4">
                      <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Explanation</div>
                        <div className="text-sm text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDetail;
