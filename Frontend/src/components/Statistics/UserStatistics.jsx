import { useState, useEffect } from 'react';
import { resultAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const UserStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await resultAPI.getUserStatistics();
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-md">
        {error}
      </div>
    );
  }

  if (!stats || !stats.statistics) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No statistics available yet.</p>
      </div>
    );
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}/${month}/${year}  ${hours}:${minutes}`;
  }

  const { statistics, recentAttempts } = stats;

  return (
    <div className="dark:text-gray-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Statistics</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your learning progress and performance</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition duration-200 hover:shadow-lg">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            {statistics.totalQuizzes}
          </div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Quizzes Taken</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition duration-200 hover:shadow-lg">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            {statistics.averagePercentage}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition duration-200 hover:shadow-lg">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {statistics.bestScore}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Best Score</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition duration-200 hover:shadow-lg">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {statistics.quizzesAttempted}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Unique Quizzes</div>
        </div>
      </div>

      {/* Best Quiz */}
      {statistics.bestQuiz && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition duration-200 hover:shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Best Performance</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {statistics.bestQuiz.title}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Score: {statistics.bestQuiz.score}/{statistics.bestQuiz.total} ({statistics.bestQuiz.percentage.toFixed(1)}%)
              </div>
            </div>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">🏆</div>
          </div>
        </div>
      )}

      {/* Recent Attempts */}
      {recentAttempts && recentAttempts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Attempts</h2>
          <div className="space-y-3">
            {recentAttempts.map((attempt, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition duration-200 hover:shadow-sm"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{attempt.quizTitle}</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDate(attempt.submittedAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      attempt.percentage >= 90
                        ? 'text-green-600 dark:text-green-400'
                        : attempt.percentage >= 70
                        ? 'text-blue-600 dark:text-blue-400'
                        : attempt.percentage >= 50
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {attempt.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {attempt.score}/{attempt.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatistics;
