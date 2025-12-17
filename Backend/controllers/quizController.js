const Quiz = require("../models/Quiz");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const { invalidateCache } = require("../config/redis");

async function handleCreateQuiz(req, res) {
  const { title, category, difficulty, questions, timeLimit, isPublished } =
    req.body;

  try {
    // Basic validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Quiz title is required",
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "At least one question is required",
      });
    }

    let categoryId = null;

    if (!category || !category.trim()) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Case 1: category is ObjectId string
    if (mongoose.Types.ObjectId.isValid(category)) {
      const existingCategory = await Category.findById(category);
      if (!existingCategory) {
        return res
          .status(400)
          .json({ message: "Invalid category ID provided" });
      }
      categoryId = existingCategory._id;
    }
    // Case 2: category is a new string name (frontend created dynamically)
    else {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, "i") },
      });
      if (existing) categoryId = existing._id;
      else {
        const newCategory = new Category({ name: category.trim() });
        await newCategory.save();
        categoryId = newCategory._id;
      }
    }

    // Process and validate each question like true false, multiple choice, etc.
    const processedQuestions = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      let processedQuestion;

      try {
        processedQuestion = await processQuestion(question, i);
      } catch (error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      processedQuestions.push(processedQuestion);
    }

    // Create new quiz
    const newQuiz = new Quiz({
      title: title.trim(),
      category: categoryId,
      difficulty,
      questions: processedQuestions,
      timeLimit: timeLimit || 300, // 5 minutes as default in seconds
      createdBy: req.user._id,
      isPublished,
    });

    await newQuiz.save();

    // Invalidate quiz caches
   await invalidateCache("cache:public:/api/quiz*");

    return res.status(201).json({
      message: "Quiz Created Successfully",
      quizId: newQuiz._id,
      quiz: {
        id: newQuiz._id,
        title: newQuiz.title,
        difficulty: newQuiz.difficulty,
        category: categoryId,
        questionCount: newQuiz.questions.length,
        timeLimit: newQuiz.timeLimit,
        createdBy: req.user.name,
      },
    });
  } catch (err) {
    console.error("Error creating quiz:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Helper function to process different question types
async function processQuestion(questionData, index) {
  const question = { ...questionData };

  // Validate basic question structure
  if (!question.question || !question.question.trim()) {
    throw new Error(`Question ${index + 1}: Question text is required`);
  }

  // Handle different question formats

  // Format 1: Multiple Choice
  if (question.options && Array.isArray(question.options)) {
    if (question.options.length < 2) {
      throw new Error(`Question ${index + 1}: Must have at least 2 options`);
    }

    // Validate options
    const emptyOption = question.options.some((opt) => !opt || !opt.trim());
    if (emptyOption) {
      throw new Error(`Question ${index + 1}: Options cannot be empty`);
    }

    // Validate correctAnswer
    if (
      question.correctAnswer === undefined ||
      question.correctAnswer === null
    ) {
      throw new Error(`Question ${index + 1}: Correct answer is required`);
    }

    if (
      question.correctAnswer < 0 ||
      question.correctAnswer >= question.options.length
    ) {
      throw new Error(`Question ${index + 1}: Correct answer index is invalid`);
    }

    return {
      question: question.question.trim(),
      options: question.options.map((opt) => opt.trim()),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation ? question.explanation.trim() : "",
      type: question.type || "multiple-choice",
    };
  }

  // Format 2: True/False questions
  else if (question.type === "true-false") {
    if (
      question.correctAnswer === undefined ||
      (question.correctAnswer !== true && question.correctAnswer !== false)
    ) {
      throw new Error(
        `Question ${
          index + 1
        }: True/False questions require a boolean correctAnswer`
      );
    }

    return {
      question: question.question.trim(),
      options: ["True", "False"],
      correctAnswer: question.correctAnswer ? 0 : 1, // Convert to index
      explanation: question.explanation ? question.explanation.trim() : "",
      type: "true-false",
    };
  }

  // Format 3: Single input field for options (comma-separated)
  else if (question.optionsString) {
    const options = question.optionsString
      .split(",")
      .map((opt) => opt.trim())
      .filter((opt) => opt);

    if (options.length < 2) {
      throw new Error(`Question ${index + 1}: Must have at least 2 options`);
    }

    if (
      question.correctAnswer === undefined ||
      question.correctAnswer < 0 ||
      question.correctAnswer >= options.length
    ) {
      throw new Error(
        `Question ${index + 1}: Valid correct answer index is required`
      );
    }

    return {
      question: question.question.trim(),
      options: options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation ? question.explanation.trim() : "",
      type: question.type || "multiple-choice",
    };
  }

  // Unknown format
  else {
    throw new Error(
      `Question ${
        index + 1
      }: Invalid question format. Provide either 'options' array or 'optionsString'`
    );
  }
}
async function handleGetAllQuizes(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const [quizzes, totalQuizzes] = await Promise.all([
      Quiz.find({ isPublished: true })
        .skip(skip)
        .limit(limit)
        .select("title difficulty questions timeLimit category createdBy")
        .populate("createdBy", "name"),
      Quiz.countDocuments({ isPublished: true }),
    ]);

    // Get all unique category IDs
    const categoryIds = [
      ...new Set(quizzes.map((q) => q.category).filter(Boolean)),
    ];

    // Fetch all categories in one query
    const categories = await Category.find({ _id: { $in: categoryIds } });
    const categoryMap = Object.fromEntries(
      categories.map((cat) => [cat._id.toString(), cat.name])
    );

    const quizList = quizzes.map((quiz) => ({
      id: quiz._id,
      title: quiz.title,
      difficulty: quiz.difficulty,
      questionCount: quiz.questions.length,
      category: quiz.category
        ? categoryMap[quiz.category.toString()] || "Uncategorized"
        : "Uncategorized",
      timeLimit: quiz.timeLimit,
      createdBy: quiz.createdBy ? quiz.createdBy.name : "Unknown",
    }));

    return res.status(200).json({
      quizzes: quizList,
      currentPage: page,
      totalPages: Math.ceil(totalQuizzes / limit),
      totalQuizzes: totalQuizzes,
    });
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handleGetUserQuizzes(req, res) {
  const role = req.user.role;
  if (!(role === "admin" || role === "superadmin")) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const userId = req.user._id;

    // Pagination
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Sorting logic
    let sortOption = {};
    if (req.query.sort === "title") sortOption = { title: 1 }; // ascending
    else if (req.query.sort === "-title")
      sortOption = { title: -1 }; //descending
    else if (req.query.sort === "date")
      sortOption = { createdAt: 1 }; // oldest first
    else if (req.query.sort === "-date")
      sortOption = { createdAt: -1 }; // newest first
    else sortOption = { createdAt: -1 }; // default=>newest first

    const filter = role === "superadmin" ? {} : { createdBy: userId };

    const [quizzes, totalQuizzes] = await Promise.all([
      Quiz.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select(
          "title difficulty questions timeLimit isPublished createdBy createdAt"
        )
        .populate("createdBy", "name email"),
      Quiz.countDocuments(filter),
    ]);

    return res.status(200).json({
      totalQuizzes: totalQuizzes,
      currentPage: page,
      totalPages: Math.ceil(totalQuizzes / limit),
      quizzes,
    });
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handleUpdateQuiz(req, res) {
  const quizId = req.params.id;
  const { title, category, difficulty, questions, timeLimit, isPublished } =
    req.body;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let isModified = false;

    if (title && quiz.title !== title) {
      quiz.title = title;
      isModified = true;
    }

    if (category && quiz.category.toString() !== category.toString()) {
      quiz.category = category;
      isModified = true;
    }

    if (difficulty && quiz.difficulty !== difficulty) {
      quiz.difficulty = difficulty;
      isModified = true;
    }

    if (
      questions &&
      JSON.stringify(quiz.questions) !== JSON.stringify(questions)
    ) {
      quiz.questions = questions;
      isModified = true;
    }

    if (timeLimit && quiz.timeLimit !== timeLimit) {
      quiz.timeLimit = timeLimit;
      isModified = true;
    }

    if (typeof isPublished === "boolean" && quiz.isPublished !== isPublished) {
      quiz.isPublished = isPublished;
      isModified = true;
    }

    if (!isModified) {
      return res.status(200).json({ message: "No changes detected" });
    }

    await quiz.save();

    // Invalidate quiz caches
   await invalidateCache("cache:public:/api/quiz*");

    return res.status(200).json({
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (err) {
    console.error("Error updating quiz:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handleGetQuizById(req, res) {
  const quizId = req.params.id;
  try {
    const quiz = await Quiz.findById(quizId).populate("createdBy", "name");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quizData = {
      id: quiz._id,
      title: quiz.title,
      difficulty: quiz.difficulty,

      category: quiz.category?._id || "NULL",
      timeLimit: quiz.timeLimit,
      questionCount: quiz.questions.length,
      createdBy: quiz.createdBy?.name || "Admin",
      questions: quiz.questions.map((q) => ({
        question: q.question,
        options: q.options,
      })),
      isPublished: quiz.isPublished,
    };

    return res.status(200).json({ quiz: quizData });
  } catch (err) {
    console.error("Error fetching quiz:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handleDeleteQuiz(req, res) {
  const quizId = req.params.id;
  try {
    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    } else {
      // Invalidate quiz caches
     await invalidateCache("cache:public:/api/quiz*");
      return res.status(200).json({ message: "Quiz deleted successfully" });
    }
  } catch (err) {
    console.error("Error deleting quiz:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handleGetQuizByCategory(req, res) {
  const category = req.params.categoryname;

  const existingCategory = await Category.findOne({ name: category });

  if (!existingCategory) {
    return res.status(400).json({ message: "Invalid category ID provided" });
  }
  const categoryId = existingCategory._id;
  try {
    //Pagination
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;



    // const quizzes = await Quiz.find({
    //   category: categoryId,
    //   isPublished: true,
    // }).skip(skip).limit(limit).populate("createdBy", "name");

    const [quizzes,totalQuizzes] = await Promise.all([
        Quiz.find({
        category: categoryId,
        isPublished: true, })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name"),


        Quiz.countDocuments({category:categoryId,isPublished:true})
    ])
    const quizList = quizzes.map((quiz) => ({
      id: quiz._id,
      title: quiz.title,
      difficulty: quiz.difficulty,
      questionCount: quiz.questions.length,
      currentPage: page,
      totalPages: Math.ceil(totalQuizzes/limit),
      category: category,
      timeLimit: quiz.timeLimit,
      createdBy: quiz.createdBy ? quiz.createdBy.name : "user",
    }));

    return res.status(200).json({ quizzes: quizList });
  } catch (err) {
    console.error("Error fetching quizzes by category:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  handleCreateQuiz,
  handleGetAllQuizes,
  handleGetQuizById,
  handleGetUserQuizzes,
  handleUpdateQuiz,
  handleDeleteQuiz,
  handleGetQuizByCategory,
};
