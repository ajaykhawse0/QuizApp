import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { quizAPI, categoryAPI } from "../../services/api";
import { ArrowLeft, Save, Plus, Trash2, HelpCircle, Settings, CheckCircle2, Circle } from "lucide-react";

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await categoryAPI.getAll(); 
        setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    difficulty: "medium",
    timeLimit: 300,
    isPublished: true,
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ],
  });

  // --- handlers ---
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    if (field === "options") {
      newQuestions[index].options = value;
    } else {
      newQuestions[index][field] = value;
    }
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.push("");
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = newQuestions[
      questionIndex
    ].options.filter((_, i) => i !== optionIndex);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) return setError("Quiz title is required");
    if (!formData.category) return setError("Category is required");

    setLoading(true);
    try {
      let categoryId = formData.category;

      if (formData.category === "__new__") {
        if (!newCategory.trim())
          return setError("Please enter a new category name");

        const { data } = await categoryAPI.create({
          name: newCategory.trim(),
        });
        categoryId = data.category._id;
      }

      await quizAPI.create({
        ...formData,
        category: categoryId,
      });

      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Link to="/admin" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Create New Quiz
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Craft an engaging quiz for your audience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-2xl shadow-sm">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Basic Info Section */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <Settings className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quiz Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                placeholder="e.g., Advanced JavaScript Concepts"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none appearance-none"
                required
              >
                <option value="" disabled>Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
                <option value="__new__">+ Create New Category</option>
              </select>

              {formData.category === "__new__" && (
                <div className="mt-3 animate-in slide-in-from-top-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category name..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none appearance-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Time Limit (seconds)
                </label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                  min="60"
                  placeholder="300"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer" onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}>
              <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 mr-3">
                {formData.isPublished ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">Publish Immediately</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Make this quiz visible right after creation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Questions Content</h2>
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center justify-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 dark:text-primary-400 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          <div className="space-y-8">
            {formData.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="relative bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 group transition-all hover:border-primary-200 dark:hover:border-primary-800"
              >
                <div className="flex items-start justify-between mb-5">
                  <h3 className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-bold text-sm">
                    {qIndex + 1}
                  </h3>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-gray-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      title="Remove Question"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Question Text <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-y min-h-[80px]"
                      placeholder="Enter the question here..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Answers <span className="text-gray-400 font-normal ml-1">(Select the correct one)</span> <span className="text-rose-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleQuestionChange(qIndex, "correctAnswer", oIndex)}
                            className="flex-shrink-0"
                            title="Mark as correct answer"
                          >
                            {question.correctAnswer === oIndex ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600 hover:text-emerald-400 transition-colors" />
                            )}
                          </button>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[oIndex] = e.target.value;
                                handleQuestionChange(qIndex, "options", newOptions);
                              }}
                              className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                question.correctAnswer === oIndex
                                  ? "border-emerald-300 dark:border-emerald-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                                  : "border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                              }`}
                              placeholder={`Option ${oIndex + 1}`}
                              required
                            />
                          </div>
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="text-gray-400 hover:text-rose-500 p-2 transition-colors"
                              title="Remove option"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="mt-3 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Option
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Explanation <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => handleQuestionChange(qIndex, "explanation", e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-y min-h-[80px]"
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-2xl w-full py-6 font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Another Question
            </button>
          </div>
        </div>

        {/* Global Actions */}
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
            <Save className="w-5 h-5" />
            {loading ? "Creating..." : "Save Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
