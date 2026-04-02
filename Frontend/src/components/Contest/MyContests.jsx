import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contestAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Trophy, CalendarClock, Clock, CheckCircle2, XCircle, ArrowRight, PlayCircle, BarChart2 } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    const styles = {
      upcoming: 'bg-blue-100/50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      live: 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${styles[s] || styles.upcoming}`}>
        {s.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Trophy className="w-8 h-8" />
            </div>
            My Contests
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mt-3">
            Track your contest participation, view results, and join active challenges.
          </p>
        </div>
        <Link
          to="/contests"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-bold transition-all shadow-sm shrink-0"
        >
          Browse All Contests
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {contests.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-200 dark:text-indigo-800 mb-6">
            <Trophy className="w-12 h-12 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No contests joined yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
            You haven't participated in any contests. Find one that interests you and start competing!
          </p>
          <Link
            to="/contests"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-bold shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Find a Contest
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {contests.map((contest, index) => (
            <div
              key={contest.id || contest._id}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800 hover:shadow-soft-xl transition-all relative overflow-hidden group animate-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              {/* Subtle background glow based on status */}
              {contest.status === 'live' && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl rounded-none pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
              )}
              {contest.status === 'upcoming' && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl rounded-none pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
              )}
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                {/* Info Column */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl shrink-0 text-gray-400">
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                        {contest.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {contest.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(contest.status)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                      <CalendarClock className="w-4 h-4 text-primary-500" />
                      {new Date(contest.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                      {contest.hasCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-700 dark:text-emerald-400">Completed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span className="text-amber-700 dark:text-amber-400">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Actions Column */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0 mt-2 lg:mt-0">
                  
                  {/* Results Card */}
                  {contest.score !== undefined && contest.hasCompleted ? (
                    <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl w-full sm:w-auto lg:w-48 text-center shrink-0">
                       <div className="flex-1 border-r border-emerald-200/50 dark:border-emerald-800/50">
                         <div className="text-xs font-bold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-widest mb-1.5">Score</div>
                         <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none">{contest.score}</div>
                       </div>
                       {contest.rank && (
                         <div className="flex-1">
                           <div className="text-xs font-bold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-widest mb-1.5">Rank</div>
                           <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 leading-none">#{contest.rank}</div>
                         </div>
                       )}
                    </div>
                  ) : (
                    <div className="hidden lg:block w-48 shrink-0"></div> // Placeholder for layout balance
                  )}

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                    <Link
                      to={`/contests/${contest.id || contest._id}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition font-bold text-sm"
                    >
                      Details
                    </Link>
                    
                    <Link
                      to={`/contests/${contest.id || contest._id}/leaderboard`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition font-bold text-sm border border-indigo-100 dark:border-indigo-800/50"
                    >
                      <BarChart2 className="w-4 h-4" />
                      Rankings
                    </Link>
                    
                    {!contest.hasCompleted && contest.status === 'live' && (
                      <Link
                        to={`/quiz/${contest.quiz?.id || contest.quiz?._id}?contestId=${contest.id || contest._id}`}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition font-bold text-sm shadow-sm hover:shadow-md animate-pulse-slow"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Join Now
                      </Link>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyContests;
