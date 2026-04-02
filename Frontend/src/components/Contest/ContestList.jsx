import { useState, useEffect } from 'react';
import { contestAPI } from '../../services/api';
import ContestCard from './ContestCard';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Trophy, CalendarClock, PlayCircle, CheckCircle2, ListFilter, Inbox } from 'lucide-react';

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, [filter]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await contestAPI.getAll(params);
      setContests(response.data.contests || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilterIcon = (status) => {
    switch (status) {
      case 'all': return <ListFilter className="w-4 h-4 mr-2" />;
      case 'upcoming': return <CalendarClock className="w-4 h-4 mr-2" />;
      case 'live': return <PlayCircle className="w-4 h-4 mr-2" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 mr-2" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
              <Trophy className="w-8 h-8" />
            </div>
            Contests
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mt-4">
            Compete with others in real-time. Join upcoming events, participate in live challenges, and review past results.
          </p>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        <div className="flex gap-3 p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-max border border-gray-200 dark:border-gray-700">
          {['all', 'upcoming', 'live', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex items-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                filter === status
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50'
              }`}
            >
              {getFilterIcon(status)}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Contest Grid */}
      {contests.length === 0 ? (
        <div className="text-center py-24 bg-gray-50/50 dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-inner">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 mb-6">
            <Inbox className="w-10 h-10" />
          </div>
          <p className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-2">No contests found</p>
          <p className="text-gray-500 dark:text-gray-400">
            There are no {filter !== 'all' ? filter : ''} contests matching your selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {contests.map((contest, index) => (
            <div 
              key={contest.id || contest._id} 
              className="animate-in fade-in slide-in-from-bottom-4" 
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <ContestCard contest={contest} onJoin={fetchContests} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContestList;
