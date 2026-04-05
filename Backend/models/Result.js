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
    quizTitle: {
      type: String,
      trim: true,
      default: null,
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      default: null,
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
resultSchema.index({ userId: 1, quizId: 1, completedAt: -1 });
resultSchema.index({ quizId: 1, score: -1, timeTaken: 1, submittedAt: -1 });

const Result = mongoose.model("Result", resultSchema);
module.exports=Result;
