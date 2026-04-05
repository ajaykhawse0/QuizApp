import { Link } from 'react-router-dom';
import { Trophy, Users, Clock, Calendar, Trash2, ArrowRight } from 'lucide-react';
import { contestAPI } from '../../services/api';
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const ContestCard = ({ contest, onJoin }) => {
  const { user, isAdmin } = useAuth();
  
  // Guard against missing id (some backends use _id)
  const contestId = contest?.id || contest?._id;

  const handleJoin = async () => {
    try {
      if (!contestId) throw new Error("Contest ID is missing.");
      await contestAPI.join(contestId);
      toast.success('Successfully joined contest!');
      onJoin?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join contest');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contest?')) return;
    
    try {
      if (!contestId) throw new Error("Contest ID is missing.");
      await contestAPI.delete(contestId);
      toast.success('Successfully deleted contest!');
      onJoin?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete contest');
    }
  };

  const getStatusBadge = () => {
    const status = contest?.status?.toLowerCase() || 'upcoming';
    const styles = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800',
      live: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800 animate-pulse-slow',
      completed: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getCardBorder = () => {
    const status = contest?.status?.toLowerCase() || 'upcoming';
    if (status === 'live') return 'border-emerald-200 dark:border-emerald-800 shadow-emerald-900/5';
    if (status === 'upcoming') return 'border-blue-200 dark:border-blue-800 shadow-blue-900/5';
    return 'border-gray-200 dark:border-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft border ${getCardBorder()} transition-all hover:shadow-soft-xl group relative overflow-hidden`}>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-primary-400/10 to-transparent dark:from-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex justify-between items-start mb-5 gap-3 relative z-10">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {contest?.title || 'Untitled Contest'}
        </h3>
        <div className="flex-shrink-0 mt-1">
          {getStatusBadge()}
        </div>
      </div>

      <p className="text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 text-sm">
        {contest?.description || 'No description provided.'}
      </p>

      <div className="space-y-3 text-sm mb-6 flex-1 bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
          <Calendar className="h-4 w-4 text-primary-500" />
          <span className="font-medium">Starts: <span className="text-gray-900 dark:text-gray-100">{formatDate(contest?.startTime)}</span></span>
        </div>
        <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
          <Clock className="h-4 w-4 text-primary-500" />
          <span className="font-medium">Ends: <span className="text-gray-900 dark:text-gray-100">{formatDate(contest?.endTime)}</span></span>
        </div>
        <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
          <Users className="h-4 w-4 text-primary-500" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {contest?.participantCount || 0} participants
            {contest?.maxParticipants ? ` / ${contest.maxParticipants}` : ''}
          </span>
        </div>
      </div>

      {contest?.prizeInfo && Object.values(contest.prizeInfo).filter(Boolean).length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3">
          <div className="p-1.5 bg-amber-200 dark:bg-amber-800 rounded-lg">
            <Trophy className="h-4 w-4 text-amber-700 dark:text-amber-300" />
          </div>
          <span className="text-sm font-bold text-amber-800 dark:text-amber-300 relative z-10 flex-1 line-clamp-1 text-ellipsis">
            {Object.values(contest.prizeInfo).filter(Boolean).join(' • ')}
          </span>
        </div>
      )}

      <div className="mt-auto flex flex-wrap sm:flex-nowrap gap-3 pt-2">
        <Link
          to={`/contests/${contestId}`}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-bold transition-all"
        >
          View Details
          <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </Link>
        
        {contest?.status !== 'completed' && !contest?.hasJoined && !isAdmin && (
          <button
            onClick={handleJoin}
            disabled={contest?.isFull}
            className="flex-1 min-w-[120px] px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            {contest?.isFull ? 'Full' : 'Join Now'}
          </button>
        )}

        {!isAdmin && contest?.hasJoined && !contest?.hasCompleted && contest?.status === 'live' && (
          <Link
            to={`/quiz/${contest?.quiz?.id || contest?.quiz?._id}?contestId=${contestId}`}
            className="flex-1 min-w-[120px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md text-center"
          >
            Enter Contest
          </Link>
        )}

        {!isAdmin && contest?.hasJoined && !contest?.hasCompleted && contest?.status === 'upcoming' && (
          <div className="flex-1 min-w-[120px] px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-bold text-center border border-blue-200 dark:border-blue-800">
            Joined - Starts Soon
          </div>
        )}

        {!isAdmin && contest?.hasCompleted && (
          <div className="flex-1 min-w-[120px] px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-bold text-center border border-emerald-200 dark:border-emerald-800">
            Completed
          </div>
        )}
        
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold text-sm"
            title="Delete Contest"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContestCard;
