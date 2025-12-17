import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {quizAPI} from '../../services/api'


const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("-date");
  const viewMode="card";
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes(currentPage, sortOption);
  }, [currentPage, sortOption]);

  const fetchQuizzes = async (page = 1, sort = "-date") => {
    try {
      setLoading(true);
      setError("");
      const params = { page, limit, sort };
      const response = await quizAPI.getUserQuizzes(params);

      setQuizzes(response.data.quizzes || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await quizAPI.delete(id);

      if (quizzes.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchQuizzes(currentPage, sortOption);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete quiz");
    }
  };

  const handleUpdate = (id) => {
    navigate(`/admin/update/${id}`);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-md">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Manage your created quizzes
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Sort Dropdown */}
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-sm md:text-base"
              >
                <option value="-date">Newest First</option>
                <option value="date">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="-title">Title Z-A</option>

              </select>


              <Link
                to="/contests/create"
                className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden sm:inline">Create Contest</span>
                <span className="sm:hidden">Contest</span>
              </Link>
              <Link
                to="/admin/create"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden sm:inline">Create New Quiz</span>
                <span className="sm:hidden">Create Quiz</span>
              </Link>
            </div>
          </div>
        </div>

        {/* No quizzes */}
        {quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-4 px-4">
              {currentPage > 1
                ? "No quizzes found on this page."
                : "No quizzes created yet."}
            </p>
            {currentPage > 1 ? (
              <button
                onClick={handlePrevious}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline font-medium"
              >
                ← Go Back
              </button>
            ) : (
              <Link
                to="/admin/create"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Create Your First Quiz
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className={`${viewMode === "card" ? "block" : "hidden"} sm:hidden space-y-4`}>
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 pr-2">
                      {quiz.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        quiz.difficulty === "easy"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          : quiz.difficulty === "medium"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                      }`}
                    >
                      {quiz.difficulty
                        ? quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)
                        : "Medium"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {quiz.questions?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          quiz.isPublished
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {quiz.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Created by:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {quiz.createdBy.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(quiz._id)}
                      className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-sm transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Update
                    </button>

                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className={`${viewMode === "table" ? "block" : "hidden"} sm:block bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      {["Title", "Difficulty", "Questions", "Status", "Created By", "Actions"].map(
                        (header) => (
                          <th
                            key={header}
                            className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {quizzes.map((quiz) => (
                      <tr
                        key={quiz._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150"
                      >
                        <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                          <div className="max-w-xs truncate">{quiz.title}</div>
                        </td>

                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                              quiz.difficulty === "easy"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                : quiz.difficulty === "medium"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                            }`}
                          >
                            {quiz.difficulty
                              ? quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)
                              : "Medium"}
                          </span>
                        </td>

                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {quiz.questions?.length || 0}
                        </td>

                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                              quiz.isPublished
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {quiz.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>

                        <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                          <div className="max-w-xs truncate">{quiz.createdBy.name}</div>
                        </td>

                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(quiz._id)}
                              className="inline-flex items-center px-3 md:px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-xs md:text-sm transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                            >
                              <svg
                                className="w-3 h-3 md:w-4 md:h-4 md:mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              <span className="hidden md:inline">Update</span>
                            </button>

                            <button
                              onClick={() => handleDelete(quiz._id)}
                              className="inline-flex items-center px-3 md:px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs md:text-sm transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                            >
                              <svg
                                className="w-3 h-3 md:w-4 md:h-4 md:mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              <span className="hidden md:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;