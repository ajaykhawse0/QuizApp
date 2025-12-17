import { useState, useEffect } from 'react';
import { contestAPI } from '../../services/api';
import ContestCard from './ContestCard';
import LoadingSpinner from '../Common/LoadingSpinner';

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [filter, setFilter] = useState('all'); // all, upcoming, live, completed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, [filter]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await contestAPI.getAll(params);
      setContests(response.data.contests);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{`${filter.charAt(0).toUpperCase() + filter.slice(1)} Contests`}</h1>
      
      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {['all', 'upcoming', 'live', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Contest Grid */}
      {contests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No contests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest) => (
            <ContestCard key={contest.id} contest={contest} onJoin={fetchContests} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContestList;
