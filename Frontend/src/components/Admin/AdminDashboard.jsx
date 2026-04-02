import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { quizAPI, contestAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Plus, PenSquare, Trash2, Filter, AlertCircle, Inbox, ChevronLeft, ChevronRight, Settings, LayoutGrid, Award } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("quizzes");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("-date");
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "quizzes") {
      fetchQuizzes(currentPage, sortOption);
    } else {
      fetchContests(currentPage, sortOption);
    }
  }, [activeTab, currentPage, sortOption]);

  const fetchQuizzes = async (page = 1, sort = "-date") => {
    try {
      setLoading(true);
      setError("");
      const params = { page, limit, sort };
      const response = await quizAPI.getUserQuizzes(params);

      setItems(response.data.quizzes || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const fetchContests = async (page = 1, sort = "-date") => {
    try {
      setLoading(true);
      setError("");
      const params = { page, limit, sort };
      // Note: we fetch all contests regardless of status for the admin
      const response = await contestAPI.getAll(params);

      setItems(response.data.contests || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load contests");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const type = activeTab === "quizzes" ? "quiz" : "contest";
    if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;

    try {
      if (activeTab === "quizzes") {
        await quizAPI.delete(id);
      } else {
        await contestAPI.delete(id);
      }
      
      if (items.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        if (activeTab === "quizzes") fetchQuizzes(currentPage, sortOption);
        else fetchContests(currentPage, sortOption);
      }
    } catch (err) {
      alert(err.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const handleUpdate = (id) => {
    if (activeTab === "quizzes") {
      navigate(`/admin/update/${id}`);
    } else {
      navigate(`/contests/update/${id}`);
    }
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

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">Error Loading Data</h3>
            <p className="text-red-700 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-6 hidden md:flex">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            Workspace
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create, edit, and manage your quizzes and contests natively.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/admin/create"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Quiz
          </Link>
          <Link
            to="/contests/create"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" />
            New Contest
          </Link>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex flex-col gap-5 mb-6 border-b border-gray-200 dark:border-gray-800 pb-6 md:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
            Workspace
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, edit, and manage your quizzes and contests.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/admin/create"
            className="flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Quiz
          </Link>
          <Link
            to="/contests/create"
            className="flex items-center justify-center gap-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 p-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" />
            Contest
          </Link>
        </div>
      </div>

      {/* Tab Navigation and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === "quizzes" 
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Quizzes
          </button>
          <button
            onClick={() => setActiveTab("contests")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === "contests" 
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
            }`}
          >
            <Award className="w-4 h-4" />
            Contests
          </button>
        </div>

        <div className="relative w-full sm:w-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="w-full sm:w-48 pl-9 pr-8 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer outline-none shadow-sm"
          >
            <option value="-date">Newest First</option>
            <option value="date">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="-title">Title Z-A</option>
          </select>
        </div>
      </div>

      {loading && items.length > 0 && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* No items state */}
      {items.length === 0 && !loading ? (
        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 mb-6">
            <Inbox className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {currentPage > 1 ? "End of the line" : `No ${activeTab} found`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            {currentPage > 1
              ? `There are no ${activeTab} on this page.`
              : `You haven't created any ${activeTab} yet.`}
          </p>
          {currentPage > 1 ? (
            <button
              onClick={handlePrevious}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium shadow-sm transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Go Back
            </button>
          ) : (
            <Link
              to={activeTab === "quizzes" ? "/admin/create" : "/contests/create"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all"
            >
              <Plus className="w-5 h-5" />
              Create First {activeTab === "quizzes" ? "Quiz" : "Contest"}
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="grid gap-4 sm:hidden">
            {items.map((item) => (
              <div
                key={item.id || item._id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:border-primary-100 dark:hover:border-primary-900/50 transition-colors"
              >
                {/* Status Badges */}
                {activeTab === "quizzes" ? (
                  item.isPublished && (
                    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                      <div className="absolute top-2 -right-6 bg-emerald-500 text-white text-[10px] font-bold py-0.5 px-6 rotate-45 shadow-sm">
                        LIVE
                      </div>
                    </div>
                  )
                ) : (
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                    <div className={`absolute top-2 -right-6 text-white text-[10px] font-bold py-0.5 px-6 rotate-45 shadow-sm ${
                      item.status === 'live' ? 'bg-emerald-500' :
                      item.status === 'upcoming' ? 'bg-amber-500' :
                      'bg-gray-500'
                    }`}>
                      {item.status ? item.status.toUpperCase() : "UNKNOWN"}
                    </div>
                  </div>
                )}

                <div className="pr-6 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2">
                    {item.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    {activeTab === "quizzes" ? (
                      <>
                        <span className={`px-2 py-0.5 rounded-md font-semibold ${
                          item.difficulty === "easy"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : item.difficulty === "medium"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                            : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                        }`}>
                          {item.difficulty ? item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1) : "Medium"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                          {item.questions?.length || 0} Qs
                        </span>
                        {!item.isPublished && (
                          <span className="px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/50">
                            Draft
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                           {item.participantCount || 0} / {item.maxParticipants || "∞"} Users
                        </span>
                        <span className="px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/50">
                          {new Date(item.startTime).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleUpdate(item.id || item._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
                  >
                    <PenSquare className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id || item._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">{activeTab === "quizzes" ? "Quiz Title" : "Contest Title"}</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    {activeTab === "quizzes" ? (
                      <>
                        <th className="px-6 py-4 text-center">Difficulty</th>
                        <th className="px-6 py-4 text-center">Questions</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-center">Time</th>
                        <th className="px-6 py-4 text-center">Participants</th>
                      </>
                    )}
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {items.map((item) => (
                    <tr key={item.id || item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white mb-1 truncate max-w-sm">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          By {item.createdBy?.name || item.createdBy || "Unknown"}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {activeTab === "quizzes" ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                            item.isPublished 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400" 
                              : "bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                          }`}>
                            {item.isPublished ? 'Published' : 'Draft'}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                            item.status === "live" ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400" :
                            item.status === "upcoming" ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400" :
                            "bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                          }`}>
                            {item.status ? item.status.toUpperCase() : "UNKNOWN"}
                          </span>
                        )}
                      </td>

                      {activeTab === "quizzes" ? (
                        <>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                              item.difficulty === "easy" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                              item.difficulty === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                              "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                            }`}>
                              {item.difficulty ? item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1) : "Medium"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-gray-600 dark:text-gray-300">
                            {item.questions?.length || 0}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-center">
                            <div className="text-gray-800 dark:text-gray-300 font-medium">
                              {new Date(item.startTime).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-gray-600 dark:text-gray-300">
                            {item.participantCount || 0} / {item.maxParticipants || "∞"}
                          </td>
                        </>
                      )}

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdate(item.id || item._id)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PenSquare className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id || item._id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 max-w-md mx-auto sm:max-w-none">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="hidden sm:flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                      currentPage === i + 1 
                        ? 'bg-primary-600 text-white' 
                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <div className="sm:hidden text-sm font-medium text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;