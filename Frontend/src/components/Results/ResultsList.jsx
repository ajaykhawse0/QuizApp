import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resultAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { ChevronRight, Clock, Target, Award, ListChecks, Calendar } from 'lucide-react';

const ResultsList = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await resultAPI.getUserResults();
      setResults(response.data.resultList || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30';
    if (percentage >= 70) return 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30';
    if (percentage >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 md:mb-12 border-b border-gray-200 dark:border-gray-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">My History</h1>
          <p className="text-gray-500 dark:text-gray-400">Review your past quiz attempts and track your progress.</p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 mb-6">
            <ListChecks className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            You haven't taken any quizzes. Start exploring and test your knowledge!
          </p>
          <Link
            to="/quizzes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all"
          >
            Take a Quiz
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {results.map((result, index) => (
            <Link
              key={index}
              to={result.id ? `/result/${result.id}` : '#'}
              className={`group flex flex-col sm:flex-row sm:items-center bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 transition-all duration-300 border border-gray-100 dark:border-gray-800 ${result.id ? 'hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-soft-xl cursor-pointer' : 'opacity-80'}`}
            >
              <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {result.quizTitle || 'Untitled Quiz'}
                  </h3>
                  {result.submittedAt && (
                    <span className="hidden sm:inline-flex items-center text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {formatDate(result.submittedAt)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span>Score: {result.score}/{result.total}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Time: {formatTime(result.timeTaken)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:ml-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                <div className="text-center sm:text-right">
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-bold ${getScoreColor(result.percentage)}`}>
                    {result.percentage.toFixed(1)}%
                  </span>
                </div>
                {result.id && (
                  <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsList;

