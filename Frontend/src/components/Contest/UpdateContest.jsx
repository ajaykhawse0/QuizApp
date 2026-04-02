import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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

const UpdateContest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [originalData, setOriginalData] = useState(null);

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
    isPublished: true,
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);
      
      const [quizRes, contestRes] = await Promise.all([
        quizAPI.getUserQuizzes({ limit: 100 }),
        contestAPI.getById(id)
      ]);

      setQuizzes(quizRes.data.quizzes || []);
      
      const contest = contestRes.data.contest;
      if (!contest) throw new Error("Contest not found");

      const initialValues = {
        title: contest.title || "",
        description: contest.description || "",
        quizId: contest.quiz?._id || contest.quiz || "",
        startTime: contest.startTime ? new Date(contest.startTime) : "",
        endTime: contest.endTime ? new Date(contest.endTime) : "",
        maxParticipants: contest.maxParticipants || "",
        prizeFirst: contest.prizeInfo?.first || "",
        prizeSecond: contest.prizeInfo?.second || "",
        prizeThird: contest.prizeInfo?.third || "",
        isPublished: contest.isPublished ?? true,
      };

      setFormData(initialValues);
      setOriginalData(initialValues);

    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error(error.response?.data?.message || "Failed to load contest data");
      navigate("/admin");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getChangedFields = () => {
    const changes = {};
    if (!originalData) return changes;

    Object.keys(formData).forEach((key) => {
      // Special handling for dates
      if (key === 'startTime' || key === 'endTime') {
        const origTime = new Date(originalData[key]).getTime();
        const newTime = new Date(formData[key]).getTime();
        if (origTime !== newTime) changes[key] = formData[key];
      } else if (formData[key] !== originalData[key]) {
        changes[key] = formData[key];
      }
    });

    return changes;
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

    if (endTime <= startTime) {
      toast.error("End time must be after start time");
      return;
    }

    const changedFields = getChangedFields();
    if (Object.keys(changedFields).length === 0) {
      toast.success("No changes made!");
      navigate("/admin");
      return;
    }

    try {
      setLoading(true);

      const updateData = {};
      
      // Map changed simple fields
      ["title", "description", "startTime", "endTime", "isPublished"].forEach(field => {
        if (changedFields[field] !== undefined) updateData[field] = changedFields[field];
      });

      if (changedFields.maxParticipants !== undefined) {
        updateData.maxParticipants = formData.maxParticipants ? parseInt(formData.maxParticipants) : null;
      }

      // Handle prizeInfo updates
      if (
        changedFields.prizeFirst !== undefined || 
        changedFields.prizeSecond !== undefined || 
        changedFields.prizeThird !== undefined
      ) {
        updateData.prizeInfo = {
          first: formData.prizeFirst,
          second: formData.prizeSecond,
          third: formData.prizeThird
        };
      }

      await contestAPI.update(id, updateData);
      toast.success("Contest updated successfully!");
      navigate("/admin");
    } catch (error) {
      console.error("Error updating contest:", error);
      toast.error(error.response?.data?.message || "Failed to update contest");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/admin" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Update Contest
          </h1>
        </div>
        
        {/* Published Toggle */}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            <span className={`ml-3 text-sm font-medium ${formData.isPublished ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"}`}>
              {formData.isPublished ? 'Live' : 'Draft'}
            </span>
          </label>
        </div>
      </div>

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
                  disabled // typically shouldn't change quiz once linked
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-500 rounded-xl focus:outline-none appearance-none cursor-not-allowed"
                >
                  <option value={formData.quizId}>
                    {quizzes.find(q => q._id === formData.quizId)?.title || "Linked Quiz"}
                  </option>
                </select>
                <p className="text-xs text-gray-500 mt-2 ml-1">The linked quiz cannot be changed after creation.</p>
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
            disabled={loading || Object.keys(getChangedFields()).length === 0}
            className="inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Contest
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateContest;
