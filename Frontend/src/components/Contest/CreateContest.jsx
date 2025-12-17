import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contestAPI, quizAPI } from "../../services/api";
import LoadingSpinner from "../Common/LoadingSpinner";
import toast from "react-hot-toast";
import DateTimePicker from "../DateTimePicker/DateTimePicker";
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Edit2,
  Plus,
  SquarePen,
} from "lucide-react";

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
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      if (formData.maxParticipants) {
        contestData.maxParticipants = parseInt(formData.maxParticipants);
      }

      if (formData.prizeFirst || formData.prizeSecond || formData.prizeThird) {
        contestData.prizeInfo = {};
        if (formData.prizeFirst)
          contestData.prizeInfo.first = formData.prizeFirst;
        if (formData.prizeSecond)
          contestData.prizeInfo.second = formData.prizeSecond;
        if (formData.prizeThird)
          contestData.prizeInfo.third = formData.prizeThird;
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

  if (loadingQuizzes) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Contest
            </h1>
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 dark:text-yellow-300">
                You need to create at least one quiz before creating a contest.
              </p>
              <button
                onClick={() => navigate("/admin/create")}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create Quiz First
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contest Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Title of Contest"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your contest..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Quiz *
                </label>
                <select
                  name="quizId"
                  value={formData.quizId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a quiz</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz._id} value={quiz._id}>
                      {quiz.title} ({quiz.questions.length} questions,{" "}
                      {quiz.difficulty})
                    </option>
                  ))}
                </select>
              </div>
              {/* Time Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DateTimePicker
                  label="Start Time *"
                  value={formData.startTime}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, startTime: val }))
                  }
                />

                <DateTimePicker
                  label="End Time *"
                  value={formData.endTime}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, endTime: val }))
                  }
                />
              </div>

              {/* Participant Limit */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Max Participants
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  placeholder="By Default unlimited"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Prize Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Prize Information (optional)
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      1st Place Prize
                    </label>
                    <input
                      type="text"
                      name="prizeFirst"
                      value={formData.prizeFirst}
                      onChange={handleChange}
                      placeholder="Description of the prize"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      2nd Place Prize
                    </label>
                    <input
                      type="text"
                      name="prizeSecond"
                      value={formData.prizeSecond}
                      onChange={handleChange}
                      placeholder="Description of the prize"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      3rd Place Prize
                    </label>
                    <input
                      type="text"
                      name="prizeThird"
                      value={formData.prizeThird}
                      onChange={handleChange}
                      placeholder="Description of the prize"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/contests")}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <SquarePen className="h-5 w-5" />
                      Create Contest
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateContest;
