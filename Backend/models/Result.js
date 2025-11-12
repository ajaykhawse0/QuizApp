const mongoose = require("mongoose");
const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number, // seconds
      required: true,
      default: 0,
    },
    correctAnswers: [Number],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: { type: Date, default: Date.now },
  
  nextAttemptAllowedAt: { type: Date }
  },
  { timestamps: true }
);
resultSchema.index({ user: 1, quiz: 1, completedAt: -1 });

const Result = mongoose.model("Result", resultSchema);
module.exports=Result;
