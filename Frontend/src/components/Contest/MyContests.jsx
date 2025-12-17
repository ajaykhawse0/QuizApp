import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contestAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Trophy, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyContests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyContests();
  }, []);

  const fetchMyContests = async () => {
    try {
      setLoading(true);
      const response = await contestAPI.getMyContests();
      setContests(response.data.contests || []);
    } catch (error) {
      console.error('Error fetching my contests:', error);
      toast.error('Failed to load your contests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">My Contests</h1>

        {contests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Trophy className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              You haven't joined any contests yet
            </p>
            <Link
              to="/contests"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Browse Contests
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contests.map((contest) => (
              <div
                key={contest.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Contest Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <Trophy className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {contest.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {contest.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span>Status: {contest.status.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {contest.hasCompleted ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              Completed
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-orange-600 dark:text-orange-400 font-semibold">
                              Not Completed
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {contest.score !== undefined && contest.hasCompleted && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Your Score: </span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {contest.score} points
                        </span>
                        {contest.rank && (
                          <span className="ml-4 text-sm text-gray-700 dark:text-gray-300">
                            Rank: <span className="font-bold">#{contest.rank}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 sm:flex-row md:flex-col min-w-[200px]">
                    <Link
                      to={`/contests/${contest.id}`}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/contests/${contest.id}/leaderboard`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-center hover:bg-indigo-700 transition font-medium"
                    >
                      Leaderboard
                    </Link>
                    {!contest.hasCompleted && contest.status === 'live' && (
                      <Link
                        to={`/quiz/${contest.quiz?.id || contest.quiz?._id}?contestId=${contest.id}`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-center hover:bg-green-700 transition font-medium"
                      >
                        Start Quiz
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyContests;
