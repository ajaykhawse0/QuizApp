import { useState, useEffect } from 'react';
import { quizAPI } from '../../services/api';
import QuizCard from './QuizCard';
import LoadingSpinner from '../Common/LoadingSpinner';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      // Remove token from URL
      window.history.replaceState({}, "", "/");
      window.location.reload(); // reload AuthProvider
    }
  }, []);

  // Fetch all categories once on component mount
  useEffect(() => {
    fetchAllCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      fetchAllQuizzes(currentPage);
    } else {
      fetchByCategory(selectedCategory);
    }
  }, [currentPage, selectedCategory]);

  const fetchAllCategories = async () => {
    try {
      const response = await quizAPI.getAll({ page: 1, limit: 1000 });
      const allQuizzes = response.data.quizzes || [];
      const uniqueCategories = ['All', ...new Set(allQuizzes.map(q => q.category || 'Uncategorized'))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Set default if fetch fails
      setCategories(['All']);
    }
  };

  const fetchAllQuizzes = async (page = 1, limit = 9) => {
    try {
      setLoading(true);
      const params = { page, limit };
      const response = await quizAPI.getAll(params);
      const quizData = response.data.quizzes || [];
      setQuizzes(quizData);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchByCategory = async (category) => {
    try {
      setLoading(true);
      const response = await quizAPI.getbyCategory(category);
      setQuizzes(response.data.quizzes || []);
      setTotalPages(1); // Usually categories are returned without pagination in this backend
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load category quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to page 1 when category changes
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            Explore Quizzes
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Challenge yourself with our curated selection of topics.
          </p>
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative w-full md:w-auto min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
          </div>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none transition-colors"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Quiz List */}
      {!loading && quizzes.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Quizzes Found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            We couldn't find any quizzes matching your selected category. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[400px]">
          {quizzes.map((quiz, index) => (
            <div key={quiz.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${index * 100}ms` }}>
              <QuizCard quiz={quiz} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination component only shown if totalPages > 1 */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
              currentPage === 1
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed hidden"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm"
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Previous
          </button>

          <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            Page <span className="text-gray-900 dark:text-white">{currentPage}</span> of <span className="text-gray-900 dark:text-white">{totalPages}</span>
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className={`flex items-center justify-center w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
              currentPage >= totalPages
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed hidden"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm"
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizList;
