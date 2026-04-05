import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resultAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Trophy, Clock, Medal, Target, ChevronLeft } from 'lucide-react';

const Leaderboard = () => {
  const { quizId } = useParams();
  const ITEMS_PER_PAGE = 10;
  const [leaderboard, setLeaderboard] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalResults: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [quizId, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [quizId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await resultAPI.getLeaderboard(quizId, {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      setLeaderboard(response.data.leaderboard || []);
      setPagination(response.data.pagination || {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        totalResults: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaderboard');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (page) => {
    if (page >= 1 && page <= Math.max(pagination.totalPages, 1) && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getVisiblePages = () => {
    const totalPages = pagination.totalPages;

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push('left-ellipsis');
    for (let page = start; page <= end; page += 1) pages.push(page);
    if (end < totalPages - 1) pages.push('right-ellipsis');

    pages.push(totalPages);
    return pages;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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

  // Show podium only on first page so absolute rank ordering stays meaningful.
  const top3 = currentPage === 1 ? leaderboard.slice(0, 3) : [];
  const others = currentPage === 1 ? leaderboard.slice(3) : leaderboard;

  // Reorder top3 for podium visual: 2nd, 1st, 3rd
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ ...top3[1], rank: 2, position: 'left' });
  if (top3[0]) podiumOrder.push({ ...top3[0], rank: 1, position: 'center' });
  if (top3[2]) podiumOrder.push({ ...top3[2], rank: 3, position: 'right' });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Leaderboard</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg mb-6">See how you stack up against the best performers in this quiz.</p>
        <Link to="/quizzes" className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Quizzes
        </Link>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 mb-6">
            <Trophy className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No leaderboard data</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-0 max-w-sm mx-auto">
            Be the first to complete this quiz and claim the top spot!
          </p>
        </div>
      ) : (
        <>
          {/* Podium for Top 3 */}
          {currentPage === 1 && podiumOrder.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-center items-end gap-4 sm:gap-6 mb-16 pt-8">
              {podiumOrder.map((entry) => {
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              
              const heightClass = isFirst ? 'h-56 sm:h-64' : isSecond ? 'h-48 sm:h-52' : 'h-40 sm:h-44';
              const colorClass = isFirst 
                ? 'from-amber-300 to-amber-500 border-amber-300 dark:from-amber-500 dark:to-amber-700 dark:border-amber-600 text-white shadow-amber-500/30' 
                : isSecond 
                ? 'from-gray-300 to-gray-400 border-gray-300 dark:from-gray-500 dark:to-gray-700 dark:border-gray-600 text-gray-900 dark:text-white shadow-gray-500/20' 
                : 'from-orange-300 to-orange-500 border-orange-300 dark:from-orange-600 dark:to-orange-800 dark:border-orange-700 text-white shadow-orange-500/20';
              
              const orderClass = entry.position === 'center' ? 'order-1 sm:order-2 z-10' : entry.position === 'left' ? 'order-2 sm:order-1' : 'order-3 sm:order-3';

                return (
                  <div key={`podium-${entry.rank}`} className={`flex flex-col items-center w-full sm:w-1/3 max-w-[220px] ${orderClass} transform transition-transform hover:-translate-y-2`}>
                  
                    {isFirst && (
                      <div className="mb-4 animate-bounce">
                        <Trophy className="w-12 h-12 text-amber-500 filter drop-shadow-md" />
                      </div>
                    )}

                    <div className="text-center w-full mb-3 px-2">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg">{entry.username}</h3>
                      <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">{entry.score} pts</div>
                    </div>

                    <div className={`w-full ${heightClass} bg-gradient-to-b ${colorClass} rounded-t-2xl shadow-lg border-t-2 flex flex-col items-center justify-start pt-6 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white opacity-10 mix-blend-overlay"></div>
                      <span className="text-5xl font-black opacity-90 drop-shadow-md">{entry.rank}</span>
                      <div className="mt-auto pb-4 w-full bg-black/10 backdrop-blur-sm text-center py-2 text-sm font-medium">
                        {formatTime(entry.timeTaken)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table for Remaining */}
          {others.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold selection:bg-transparent">
                      <th className="px-6 py-4 w-20 text-center">Rank</th>
                      <th className="px-6 py-4">Player</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4 text-center">Accuracy</th>
                      <th className="px-6 py-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                    {others.map((entry, index) => {
                      const actualRank = entry.rank || (currentPage === 1 ? index + 4 : index + 1 + (currentPage - 1) * ITEMS_PER_PAGE);
                      return (
                        <tr key={`rank-${actualRank}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                          <td className="px-6 py-5 text-center font-bold text-gray-400 dark:text-gray-600">
                            {actualRank}
                          </td>
                          <td className="px-6 py-5 font-semibold text-gray-900 dark:text-white">
                            {entry.username}
                          </td>
                          <td className="px-6 py-5 text-center text-gray-600 dark:text-gray-300 font-medium">
                            {entry.score}/{entry.total}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              entry.percentage >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              entry.percentage >= 70 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              entry.percentage >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            }`}>
                              {entry.percentage.toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right font-mono text-gray-500 dark:text-gray-400">
                            {formatTime(entry.timeTaken)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalResults} players)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1 flex-wrap">
                  {getVisiblePages().map((pageItem) => {
                    if (typeof pageItem !== 'number') {
                      return (
                        <span
                          key={pageItem}
                          className="px-2 text-sm text-gray-500 dark:text-gray-400"
                        >
                          ...
                        </span>
                      );
                    }

                    const isActive = pageItem === currentPage;
                    return (
                      <button
                        key={pageItem}
                        type="button"
                        onClick={() => onPageChange(pageItem)}
                        className={`min-w-9 h-9 px-2 rounded-lg text-sm font-semibold border transition-colors ${
                          isActive
                            ? 'bg-primary-600 border-primary-600 text-white dark:bg-primary-500 dark:border-primary-500'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageItem}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
