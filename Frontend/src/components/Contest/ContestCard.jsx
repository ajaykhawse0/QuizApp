import { Link } from 'react-router-dom';
import { Trophy, Users, Clock, Calendar, Trash2 } from 'lucide-react';
import { contestAPI } from '../../services/api';
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const ContestCard = ({ contest, onJoin }) => {
  const { user, isAdmin } = useAuth();

  const handleJoin = async () => {
    try {
      await contestAPI.join(contest.id);
      toast.success('Successfully joined contest!');
      onJoin?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join contest');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contest?')) return;
    
    try {
      await contestAPI.delete(contest.id);
      toast.success('Successfully deleted contest!');
      onJoin?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete contest');
    }
  };
  const getStatusBadge = () => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      live: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[contest.status]}`}>
        {contest.status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{contest.title}</h3>
        {getStatusBadge()}
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{contest.description}</p>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Calendar className="h-4 w-4" />
          <span>Starts: {new Date(contest.startTime).toLocaleString('en-GB')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Clock className="h-4 w-4" />
          <span>Ends: {new Date(contest.endTime).toLocaleString('en-GB')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Users className="h-4 w-4" />
          <span>
            {contest.participantCount} participants
            {contest.maxParticipants && ` / ${contest.maxParticipants}`}
          </span>
        </div>
      </div>

      {contest.prizeInfo && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Prizes Available!</span>
        </div>
      )}

      <div className="flex gap-2">
        <Link
          to={`/contests/${contest.id}`}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          View Details
        </Link>
        {contest.status !== 'completed' && !contest.hasJoined && !isAdmin && (
          <button
            onClick={handleJoin}
            disabled={contest.isFull}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {contest.isFull ? 'Full' : 'Join'}
          </button>
        )}
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ContestCard;
