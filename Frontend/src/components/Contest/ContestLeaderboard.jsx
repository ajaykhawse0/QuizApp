import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Trophy, Medal, Award } from 'lucide-react';

const ContestLeaderboard = () => {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [contestInfo, setContestInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    // Auto-refresh every 30 seconds for live contests
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 30000);

    return () => clearInterval(interval);
  }, [id]);

  const fetchLeaderboard = async () => {
    try {
      const response = await contestAPI.getLeaderboard(id);
      setLeaderboard(response.data.leaderboard);
      setContestInfo(response.data.contest);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 2:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400';
      case 3:
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Contest Info */}
        {contestInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {contestInfo.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Contest Leaderboard</p>
              </div>
              <Link
                to={`/contests/${id}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Back to Contest
              </Link>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-indigo-600 dark:bg-indigo-800 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Rankings
            </h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No participants have completed the quiz yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user.id || entry.user._id || index}
                  className={`p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                    getRankBadgeColor(entry.rank)
                  }`}
                >
                  {/* Rank */}
                  <div className="w-12 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {entry.user.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {entry.user.email}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {entry.score}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
                  </div>

                  {/* Time */}
                  {entry.completedAt && (
                    <div className="text-center min-w-[100px]">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(entry.completedAt).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">completed</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto-refresh indicator */}
        {contestInfo?.status === 'live' && (
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            🔄 Auto-refreshing every 30 seconds
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestLeaderboard;
