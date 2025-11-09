import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resultAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 70) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">My Results</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">View your quiz attempts and performance</p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No quiz results yet.</p>
          <Link
            to="/"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            Take your first quiz →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {result.quizTitle || 'Quiz'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      Score: {result.score}/{result.total}
                    </span>
                    <span className={`font-semibold ${getScoreColor(result.percentage)}`}>
                      {result.percentage.toFixed(1)}%
                    </span>
                    <span>Time: {formatTime(result.timeTaken)}</span>
                    {result.submittedAt && (
                      <span className="hidden sm:inline">{formatDate(result.submittedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="sm:ml-4">
                  {result.id ? (
                    <Link
                      to={`/result/${result.id}`}
                      className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition block text-center sm:inline-block"
                    >
                      View Details
                    </Link>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">No details available</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsList;

