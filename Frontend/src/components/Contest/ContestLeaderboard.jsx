import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Trophy, RefreshCw, ArrowLeft, Clock } from 'lucide-react';

const ContestLeaderboard = () => {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [contestInfo, setContestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 30 seconds for live contests
    const interval = setInterval(() => {
      fetchLeaderboard(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [id]);

  const fetchLeaderboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await contestAPI.getLeaderboard(id);
      setLeaderboard(response.data.leaderboard || []);
      setContestInfo(response.data.contest);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  // Separate top 3 for podium
  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  // Reorder top3 for podium visual: 2nd, 1st, 3rd
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ ...top3[1], podiumRank: 2, position: 'left' });
  if (top3[0]) podiumOrder.push({ ...top3[0], podiumRank: 1, position: 'center' });
  if (top3[2]) podiumOrder.push({ ...top3[2], podiumRank: 3, position: 'right' });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <Link to={`/contests/${id}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Contest
        </Link>
      </div>

      {contestInfo && (
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-amber-100/50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
            {contestInfo.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg mb-6 flex items-center justify-center gap-2">
            Official Leaderboard
            {contestInfo.status === 'live' && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full animate-pulse-slow">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE
              </span>
            )}
          </p>
        </div>
      )}

      {leaderboard.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 mb-6">
            <Trophy className="w-10 h-10 opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No participants yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-0 max-w-sm mx-auto">
            Wait for participants to complete the contest. Rankings will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Podium for Top 3 */}
          <div className="flex flex-col sm:flex-row justify-center items-end gap-4 sm:gap-6 mb-16 pt-8">
            {podiumOrder.map((entry) => {
              const rank = entry.rank;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              
              const heightClass = isFirst ? 'h-56 sm:h-64' : isSecond ? 'h-48 sm:h-52' : 'h-40 sm:h-44';
              const colorClass = isFirst 
                ? 'from-amber-300 to-amber-500 border-amber-300 dark:from-amber-500 dark:to-amber-700 dark:border-amber-600 text-white shadow-amber-500/30' 
                : isSecond 
                ? 'from-gray-300 to-gray-400 border-gray-300 dark:from-gray-500 dark:to-gray-700 dark:border-gray-600 text-gray-900 dark:text-white shadow-gray-500/20' 
                : 'from-orange-300 to-orange-500 border-orange-300 dark:from-orange-600 dark:to-orange-800 dark:border-orange-700 text-white shadow-orange-500/20';
              
              const orderClass = entry.position === 'center' ? 'order-1 sm:order-2 z-10' : entry.position === 'left' ? 'order-2 sm:order-1' : 'order-3 sm:order-3';

              return (
                <div key={`podium-${rank}`} className={`flex flex-col items-center w-full sm:w-1/3 max-w-[220px] ${orderClass} transform transition-transform hover:-translate-y-2`}>
                  
                  {isFirst && (
                    <div className="mb-4 animate-bounce">
                      <Trophy className="w-12 h-12 text-amber-500 filter drop-shadow-md" />
                    </div>
                  )}

                  <div className="text-center w-full mb-3 px-2">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg">{entry.user.name}</h3>
                    <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">{entry.score} pts</div>
                  </div>

                  <div className={`w-full ${heightClass} bg-gradient-to-b ${colorClass} rounded-t-2xl shadow-lg border-t-2 flex flex-col items-center justify-start pt-6 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white opacity-10 mix-blend-overlay"></div>
                    <span className="text-5xl font-black opacity-90 drop-shadow-md">{rank}</span>
                    <div className="mt-auto pb-4 w-full bg-black/10 backdrop-blur-sm text-center py-2 text-sm font-medium flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 opacity-70" />
                      {new Date(entry.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table for Remaining */}
          {others.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold selection:bg-transparent">
                      <th className="px-6 py-4 w-20 text-center">Rank</th>
                      <th className="px-6 py-4">Participant</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4 text-right">Completed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                    {others.map((entry) => (
                      <tr key={`rank-${entry.rank}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        <td className="px-6 py-5 text-center font-bold text-gray-400 dark:text-gray-600">
                          #{entry.rank}
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {entry.user.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {entry.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center text-primary-600 dark:text-primary-400 font-bold">
                          {entry.score} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">pts</span>
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-gray-500 dark:text-gray-400 text-xs">
                          {new Date(entry.completedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Auto-refresh indicator */}
      {contestInfo?.status === 'live' && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 py-2 px-4 rounded-full shadow-sm border border-gray-100 dark:border-gray-800 w-max mx-auto">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
          Auto-refreshing every 30s
        </div>
      )}
    </div>
  );
};

export default ContestLeaderboard;
