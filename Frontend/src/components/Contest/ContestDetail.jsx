import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Trophy, Users, Clock, Play, Calendar, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
      setLoading(true);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-2xl shadow-sm text-center flex flex-col items-center">
          <ShieldCheck className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Contest Not Found</h2>
          <p className="text-red-600 dark:text-red-400 mb-6">The contest you are looking for does not exist or has been removed.</p>
          <Link to="/contests" className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 px-6 py-2 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-700 transition">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    const status = contest.status.toLowerCase();
    const styles = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800',
      live: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800 animate-pulse-slow',
      completed: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${styles[status] || styles.upcoming}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Link to="/contests" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Contests
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft-xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-400/10 to-transparent dark:from-primary-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="p-8 sm:p-12 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
                {contest.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl leading-relaxed">
                {contest.description}
              </p>
            </div>
            <div className="flex-shrink-0">
              {getStatusBadge()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-start gap-4 transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-primary-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Participants</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {contest.participantCount}
                  <span className="text-base text-gray-400 font-medium">
                    {contest.maxParticipants ? ` / ${contest.maxParticipants}` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-start gap-4 transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-blue-500">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Start Time</div>
                <div className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                  {new Date(contest.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-start gap-4 transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-rose-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">End Time</div>
                <div className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                  {new Date(contest.endTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}
                </div>
              </div>
            </div>
          </div>

          {/* Prize Info (if available) - Object structure based on original */}
          {contest.prizeInfo && (contest.prizeInfo.first || contest.prizeInfo.second || contest.prizeInfo.third) && (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-8 rounded-3xl mb-10 border border-amber-200 dark:border-amber-700/50 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-amber-500/10 dark:text-amber-500/5 transition-transform group-hover:scale-110 duration-500">
                <Trophy className="w-48 h-48" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-500 rounded-lg text-white shadow-md">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-300 tracking-tight">Prize Pool</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {contest.prizeInfo.first && (
                    <div className="bg-white/60 dark:bg-gray-900/40 p-5 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 backdrop-blur-sm">
                      <div className="text-3xl mb-2">🥇</div>
                      <div className="text-sm font-bold text-amber-900/60 dark:text-amber-400/60 uppercase tracking-widest mb-1">1st Place</div>
                      <div className="font-bold text-amber-950 dark:text-amber-100 text-lg">{contest.prizeInfo.first}</div>
                    </div>
                  )}
                  {contest.prizeInfo.second && (
                    <div className="bg-white/60 dark:bg-gray-900/40 p-5 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 backdrop-blur-sm">
                      <div className="text-3xl mb-2">🥈</div>
                      <div className="text-sm font-bold text-amber-900/60 dark:text-amber-400/60 uppercase tracking-widest mb-1">2nd Place</div>
                      <div className="font-bold text-amber-950 dark:text-amber-100 text-lg">{contest.prizeInfo.second}</div>
                    </div>
                  )}
                  {contest.prizeInfo.third && (
                    <div className="bg-white/60 dark:bg-gray-900/40 p-5 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 backdrop-blur-sm">
                      <div className="text-3xl mb-2">🥉</div>
                      <div className="text-sm font-bold text-amber-900/60 dark:text-amber-400/60 uppercase tracking-widest mb-1">3rd Place</div>
                      <div className="font-bold text-amber-950 dark:text-amber-100 text-lg">{contest.prizeInfo.third}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fallback if prizeInfo is just a string (depending on backend implementation) */}
          {typeof contest.prizeInfo === 'string' && contest.prizeInfo.trim() !== '' && (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 md:p-8 rounded-3xl mb-10 border border-amber-200 dark:border-amber-700/50 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg shrink-0">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-300 mb-2">Rewards</h3>
                <p className="text-amber-800 dark:text-amber-200 font-medium text-lg">{contest.prizeInfo}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              to={`/contests/${id}/leaderboard`}
              className="flex-1 px-8 py-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl text-center font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 opacity-70" />
              View Leaderboard
            </Link>
            
            {!contest.hasJoined && contest.status !== 'completed' && (
              <button
                onClick={handleJoin}
                disabled={contest.isFull}
                className="flex-[2] px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:hover:shadow-md active:scale-[0.98] flex items-center justify-center text-lg"
              >
                {contest.isFull ? 'Contest Full' : 'Join Contest Now'}
              </button>
            )}
            
            {contest.hasJoined && !contest.hasCompleted && contest.status === 'live' && (
              <Link
                to={`/quiz/${contest.quiz?.id || contest.quiz?._id}?contestId=${contest.id}`}
                className="flex-[2] px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-center font-bold flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] text-lg"
              >
                <div className="p-1 bg-white/20 rounded-full">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                Enter Quiz
              </Link>
            )}

            {contest.hasCompleted && (
              <div className="flex-[2] px-8 py-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-2xl text-center font-bold flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
                You have completed this contest
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestDetail;
