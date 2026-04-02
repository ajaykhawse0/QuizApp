import { useState, useEffect } from 'react';
import { resultAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Trophy, Target, Award, Hash, Activity, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats || !stats.statistics) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 mb-6">
            <Activity className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No statistics available</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            You haven't taken any quizzes yet. Your learning journey stats will appear here!
          </p>
          <Link
            to="/quizzes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all"
          >
            Explore Quizzes
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  const { statistics, recentAttempts } = stats;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your learning progress and performance metrics.</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Total Quizzes */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800 hover:shadow-soft-xl transition-shadow flex items-center justify-between group">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Taken</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {statistics.totalQuizzes}
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Hash className="w-7 h-7" />
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800 hover:shadow-soft-xl transition-shadow flex items-center justify-between group">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average Score</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {statistics.averagePercentage}%
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Target className="w-7 h-7" />
          </div>
        </div>

        {/* Best Score */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800 hover:shadow-soft-xl transition-shadow flex items-center justify-between group">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Best Score</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {statistics.bestScore}%
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* Unique Quizzes */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800 hover:shadow-soft-xl transition-shadow flex items-center justify-between group">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Unique Quizzes</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {statistics.quizzesAttempted}
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Activity className="w-7 h-7" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Best Quiz */}
        <div className="col-span-1 lg:col-span-1 flex flex-col gap-8">
          {statistics.bestQuiz ? (
            <div className="bg-gradient-to-br from-primary-600 to-indigo-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="relative z-10 w-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <Trophy className="w-6 h-6 text-yellow-300" />
                  </div>
                  <h2 className="text-xl font-semibold">Top Performance</h2>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 line-clamp-2 min-h-[4rem]">
                  {statistics.bestQuiz.title}
                </h3>
                
                <div className="flex items-end justify-between mt-auto pt-6 border-t border-white/20">
                  <div>
                    <div className="text-primary-100 text-sm mb-1 text-nowrap">Score Format</div>
                    <div className="font-semibold text-lg text-nowrap">{statistics.bestQuiz.score} out of {statistics.bestQuiz.total}</div>
                  </div>
                  <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
                    {statistics.bestQuiz.percentage.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-soft border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Top Performance</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Aced a quiz? It will appear here!</p>
            </div>
          )}
        </div>

        {/* Right Column: Recent Attempts */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800 h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                Recent History
              </h2>
              <Link to="/results" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                View All
              </Link>
            </div>

            {recentAttempts && recentAttempts.length > 0 ? (
              <div className="space-y-4">
                {recentAttempts.map((attempt, index) => (
                  <div
                    key={index}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-100 dark:hover:border-primary-900/50 transition-all duration-300"
                  >
                    <div className="mb-3 sm:mb-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg mb-1 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {attempt.quizTitle}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(attempt.submittedAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-5 justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Points</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{attempt.score}/{attempt.total}</div>
                      </div>
                      <div className="w-px h-10 bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                      <div className="min-w-[60px] text-right">
                        <div
                          className={`text-2xl font-bold ${
                            attempt.percentage >= 90
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : attempt.percentage >= 70
                              ? 'text-primary-600 dark:text-primary-400'
                              : attempt.percentage >= 50
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {attempt.percentage.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ListChecks className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No attempts recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;
