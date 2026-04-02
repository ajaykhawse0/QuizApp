import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { contestAPI, quizAPI } from "../../services/api";
import LoadingSpinner from "../Common/LoadingSpinner";
import toast from "react-hot-toast";
import DateTimePicker from "../DateTimePicker/DateTimePicker";
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Save,
  ArrowLeft,
  Settings,
  Layers,
  Award
} from "lucide-react";

const toIsoFromLocalDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const CreateContest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quizId: "",
    startTime: "",
    endTime: "",
    maxParticipants: "",
    prizeFirst: "",
    prizeSecond: "",
    prizeThird: "",
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const response = await quizAPI.getUserQuizzes({ limit: 100 });
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Contest title is required");
      return;
    }
    if (!formData.quizId) {
      toast.error("Please select a quiz");
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error("Start and end times are required");
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    const now = new Date();

    if (startTime <= now) {
      toast.error("Start time must be in the future");
      return;
    }
    if (endTime <= startTime) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      setLoading(true);

      const contestData = {
        title: formData.title,
        description: formData.description,
        quizId: formData.quizId,
        startTime: toIsoFromLocalDateTime(formData.startTime),
        endTime: toIsoFromLocalDateTime(formData.endTime),
      };

      if (formData.maxParticipants) {
        contestData.maxParticipants = parseInt(formData.maxParticipants);
      }

      if (formData.prizeFirst || formData.prizeSecond || formData.prizeThird) {
        contestData.prizeInfo = {};
        if (formData.prizeFirst) contestData.prizeInfo.first = formData.prizeFirst;
        if (formData.prizeSecond) contestData.prizeInfo.second = formData.prizeSecond;
        if (formData.prizeThird) contestData.prizeInfo.third = formData.prizeThird;
      }

      await contestAPI.create(contestData);
      toast.success("Contest created successfully!");
      navigate("/contests");
    } catch (error) {
      console.error("Error creating contest:", error);
      toast.error(error.response?.data?.message || "Failed to create contest");
    } finally {
      setLoading(false);
    }
  };

  if (loadingQuizzes) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <Link to="/admin" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Create Contest
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Host a competitive event with a live leaderboard and prizes.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between shadow-sm">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-1">No Quizzes Available</h3>
            <p className="text-amber-800 dark:text-amber-400/80">
              You need to create at least one quiz to link to your contest.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/create")}
            className="w-full sm:w-auto px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-semibold shadow-sm"
          >
            Create Quiz First
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Setup */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <Settings className="w-5 h-5 text-primary-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Setup</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contest Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Spring Coding Challenge 2026"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What is this contest about?"
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-y min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Linked Quiz <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <select
                    name="quizId"
                    value={formData.quizId}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none appearance-none"
                    required
                  >
                    <option value="" disabled>Select the quiz for this contest</option>
                    {quizzes.map((quiz) => (
                      <option key={quiz._id} value={quiz._id}>
                        {quiz.title} • {quiz.questions?.length || 0} Questions • {(quiz.difficulty || 'medium').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Limits */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <Clock className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Schedule & Rules</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Starts At <span className="text-rose-500">*</span>
                </label>
                <DateTimePicker
                  value={formData.startTime}
                  onChange={(val) => setFormData((prev) => ({ ...prev, startTime: val }))}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Ends At <span className="text-rose-500">*</span>
                </label>
                <DateTimePicker
                  value={formData.endTime}
                  onChange={(val) => setFormData((prev) => ({ ...prev, endTime: val }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Participant Limit <span className="text-gray-400 font-normal ml-1">(Leave blank for unlimited)</span>
              </label>
              <div className="relative max-w-sm">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  min="1"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Prizes */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Prizes & Rewards</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="w-32 font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2 shrink-0">
                  <span className="text-xl">🥇</span> 1st Place
                </div>
                <input
                  type="text"
                  name="prizeFirst"
                  value={formData.prizeFirst}
                  onChange={handleChange}
                  placeholder="e.g., $500 Gift Card"
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="w-32 font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 shrink-0">
                  <span className="text-xl">🥈</span> 2nd Place
                </div>
                <input
                  type="text"
                  name="prizeSecond"
                  value={formData.prizeSecond}
                  onChange={handleChange}
                  placeholder="e.g., $250 Gift Card"
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="w-32 font-bold text-amber-700 dark:text-amber-700 flex items-center gap-2 shrink-0">
                  <span className="text-xl">🥉</span> 3rd Place
                </div>
                <input
                  type="text"
                  name="prizeThird"
                  value={formData.prizeThird}
                  onChange={handleChange}
                  placeholder="e.g., $100 Gift Card"
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 sticky bottom-6 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Contest
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateContest;
