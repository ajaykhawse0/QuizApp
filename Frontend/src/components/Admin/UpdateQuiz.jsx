import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { quizAPI, categoryAPI } from "../../services/api";

const UpdateQuiz = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  // Store original data to compare changes
  const [originalData, setOriginalData] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    difficulty: "medium",
    timeLimit: 300,
    isPublished: false,
    questions: [],
  });

  useEffect(() => {
    const fetchQuizAndCategories = async () => {
      try {
        const [quizRes, catRes] = await Promise.all([
          quizAPI.getById(id),
          categoryAPI.getAll(),
        ]);
        setCategories(catRes.data.categories);

        const quizData = {
          title: quizRes.data.quiz.title || "",
          category: quizRes.data.quiz.category || "",
          difficulty: quizRes.data.quiz.difficulty || "medium",
          timeLimit: quizRes.data.quiz.timeLimit || 300,
          isPublished: quizRes.data.quiz.isPublished || false,
          questions:
            quizRes.data.quiz.questions && quizRes.data.quiz.questions.length > 0
              ? quizRes.data.quiz.questions
              : [
                  {
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: 0,
                    explanation: "",
                  },
                ],
        };

        // Store both original and current form data
        setOriginalData(quizData);
        setFormData(quizData);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz details.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAndCategories();
  }, [id]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
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
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setFormData({ ...formData, questions: newQuestions });
  };

  // Helper function to detect changes
  const getChangedFields = () => {
    const changes = {};

    if (formData.title !== originalData.title) {
      changes.title = formData.title;
    }

    if (formData.category !== originalData.category) {
      changes.category = formData.category;
    }

    if (formData.difficulty !== originalData.difficulty) {
      changes.difficulty = formData.difficulty;
    }

    if (formData.timeLimit !== originalData.timeLimit) {
      changes.timeLimit = formData.timeLimit;
    }

    if (formData.isPublished !== originalData.isPublished) {
      changes.isPublished = formData.isPublished;
    }

    // Deep comparison for questions array
    if (JSON.stringify(formData.questions) !== JSON.stringify(originalData.questions)) {
      changes.questions = formData.questions.map((q) => ({
        ...q,
        correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
      }));
    }

    return changes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) return setError("Quiz title is required");
    if (!formData.category) return setError("Category is required");

    const changes = getChangedFields();

    // Check if there are any changes
    if (Object.keys(changes).length === 0) {
      setError("No changes detected. Update something to save.");
      return;
    }

    setSaving(true);
    try {
      let categoryId = formData.category;

      // Handle new category creation
      if (formData.category === "__new__") {
        if (!newCategory.trim()) {
          setError("Please enter a new category name");
          setSaving(false);
          return;
        }
        const { data } = await categoryAPI.create({ name: newCategory.trim() });
        categoryId = data.category._id;
        changes.category = categoryId;
      }

      // Send only changed fields
      await quizAPI.update(id, changes);

      navigate("/admin");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-700 dark:text-gray-300 text-lg">
        Loading quiz details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Update Quiz
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modify existing quiz details and questions.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6"
      >
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quiz Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
              <option value="__new__">+ Add New Category</option>
            </select>

            {formData.category === "__new__" && (
              <div className="mt-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Limit (seconds)
              </label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) =>
                  setFormData({ ...formData, timeLimit: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                min="60"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) =>
                setFormData({ ...formData, isPublished: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Mark as Published
            </label>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Questions
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow-md"
            >
              + Add Question
            </button>
          </div>

          {formData.questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-700/40"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Question {qIndex + 1}
                </h3>
                {formData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              <textarea
                value={question.question}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "question", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg"
                placeholder="Enter question text"
              />

              <div>
                {question.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-2 mb-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() =>
                        handleQuestionChange(qIndex, "correctAnswer", oIndex)
                      }
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...question.options];
                        newOpts[oIndex] = e.target.value;
                        handleQuestionChange(qIndex, "options", newOpts);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg"
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  + Add Option
                </button>
              </div>

              <textarea
                value={question.explanation}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "explanation", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg"
                placeholder="Explanation (optional)"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateQuiz;