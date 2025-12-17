import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Trophy, Users, Clock, Play, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ContestDetail = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContest();
  }, [id]);

  const fetchContest = async () => {
    try {
      const response = await contestAPI.getById(id);
      setContest(response.data.contest);
    } catch (error) {
      console.error('Error fetching contest:', error);
      toast.error('Failed to load contest');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await contestAPI.join(id);
      toast.success('Successfully joined!');
      fetchContest();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          Contest not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{contest.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">{contest.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
              <div className={`text-xl font-bold ${
                contest.status === 'live' ? 'text-green-600 dark:text-green-400' :
                contest.status === 'upcoming' ? 'text-blue-600 dark:text-blue-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {contest.status.toUpperCase()}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <Users className="h-5 w-5 mb-1 text-gray-700 dark:text-gray-300" />
              <div className="text-sm text-gray-500 dark:text-gray-400">Participants</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {contest.participantCount}
                {contest.maxParticipants && ` / ${contest.maxParticipants}`}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <Calendar className="h-5 w-5 mb-1 text-gray-700 dark:text-gray-300" />
              <div className="text-sm text-gray-500 dark:text-gray-400">Start Time</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(contest.startTime).toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <Clock className="h-5 w-5 mb-1 text-gray-700 dark:text-gray-300" />
              <div className="text-sm text-gray-500 dark:text-gray-400">End Time</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(contest.endTime).toLocaleString()}
              </div>
            </div>
          </div>

          {contest.prizeInfo && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg mb-6 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Prize Pool</h3>
              </div>
              <div className="space-y-2 text-gray-800 dark:text-gray-200">
                {contest.prizeInfo.first && <div>🥇 1st Place: {contest.prizeInfo.first}</div>}
                {contest.prizeInfo.second && <div>🥈 2nd Place: {contest.prizeInfo.second}</div>}
                {contest.prizeInfo.third && <div>🥉 3rd Place: {contest.prizeInfo.third}</div>}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={`/contests/${id}/leaderboard`}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-center font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              View Leaderboard
            </Link>
            
            {!contest.hasJoined && contest.status !== 'completed' && (
              <button
                onClick={handleJoin}
                disabled={contest.isFull}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {contest.isFull ? 'Contest Full' : 'Join Contest'}
              </button>
            )}
            
            {contest.hasJoined && !contest.hasCompleted && contest.status === 'live' && (
              <Link
                to={`/quiz/${contest.quiz.id || contest.quiz._id}?contestId=${contest.id}`}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg text-center font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition"
              >
                <Play className="h-5 w-5" />
                Start Quiz
              </Link>
            )}

            {contest.hasCompleted && (
              <div className="flex-1 px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-center font-semibold">
                ✓ Completed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestDetail;
