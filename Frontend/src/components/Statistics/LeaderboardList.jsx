import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI, resultAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const LeaderboardList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (quizzes.length > 0) {
      fetchAllLeaderboards();
    }
  }, [quizzes]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getAll();
      setQuizzes(response.data.quizzes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLeaderboards = async () => {
    try {
      const leaderboardPromises = quizzes.map(async (quiz) => {
        try {
          const response = await resultAPI.getLeaderboard(quiz.id);
          return {
            quizId: quiz.id,
            leaderboard: response.data.leaderboard || []
          };
        } catch (err) {
          return {
            quizId: quiz.id,
            leaderboard: []
          };
        }
      });

      const results = await Promise.all(leaderboardPromises);
      const leaderboardMap = {};
      results.forEach((result) => {
        leaderboardMap[result.quizId] = result.leaderboard;
      });
      setLeaderboards(leaderboardMap);
    } catch (err) {
      console.error('Error fetching leaderboards:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaderboards</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">View top performers for each quiz</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No quizzes available yet.</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {quizzes.map((quiz) => {
            const leaderboard = leaderboards[quiz.id] || [];
            const hasLeaderboard = leaderboard.length > 0;

            return (
              <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {quiz.questionCount} Questions
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          quiz.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                          quiz.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                          'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/leaderboard/${quiz.id}`}
                      className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap text-center"
                    >
                      View Full Leaderboard
                    </Link>
                  </div>
                </div>

                {hasLeaderboard ? (
                  <div className="p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 Performers</h3>
                    <div className="space-y-3">
                      {leaderboard.slice(0, 5).map((entry, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 md:p-4 rounded-lg ${
                            index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 dark:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                            <span className="text-xl md:text-2xl font-bold w-10 md:w-12 text-center flex-shrink-0">
                              {getRankIcon(index + 1)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white truncate">{entry.username}</div>
                              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {entry.score}/{entry.total} • {formatTime(entry.timeTaken)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className={`text-base md:text-lg font-bold ${
                              entry.percentage >= 90 ? 'text-green-600 dark:text-green-400' :
                              entry.percentage >= 70 ? 'text-blue-600 dark:text-blue-400' :
                              entry.percentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {entry.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 md:p-6 text-center text-gray-500 dark:text-gray-400">
                    <p>No attempts yet. Be the first to take this quiz!</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaderboardList;

