import { useState, useEffect } from 'react';
import { quizAPI } from '../../services/api';
import QuizCard from './QuizCard';
import LoadingSpinner from '../Common/LoadingSpinner';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    fetchAllQuizzes(currentPage);
  }, [currentPage]);

  const fetchAllQuizzes = async (page=1, limit=10) => {
    try {
      setLoading(true);
      const params = { page, limit};
      const response = await quizAPI.getAll(params);
      const quizData = response.data.quizzes || [];
      setQuizzes(quizData);
      setTotalPages(response.data.totalPages || 1);
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(quizData.map(q => q.category || 'Uncategorized'))];
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchByCategory = async (category) => {
    try {
      setLoading(true);
      if (category === 'All') {
        await fetchAllQuizzes(1); // Always fetch page 1 when changing to 'All'
        return;
      }
      const response = await quizAPI.getbyCategory(category);
      setQuizzes(response.data.quizzes || []);
  
      setTotalPages(1);
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
    fetchByCategory(category);
  };

    const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (<>
    <div>
      {/* Header and Filter */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Available Quizzes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Test your knowledge with our collection of quizzes
          </p>
        </div>

        {/* Category Filter Dropdown */}
        <div>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No quizzes available for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
     <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`w-full sm:w-auto px-5 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
                  currentPage === 1
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md hover:scale-105"
                }`}
              >
                ← Previous
              </button>

              <span className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage >= totalPages}
                className={`w-full sm:w-auto px-5 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
                  currentPage >= totalPages
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md hover:scale-105"
                }`}
              >
                Next →
              </button>
            </div>
             </>
  );
};

export default QuizList;
