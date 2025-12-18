const express = require("express");
const router = express.Router();

const {
  handleSubmitQuiz,
  handleGetResultsByUser,
  leaderboard,
  handleGetResultById,
  handleGetAllResults,
  handleGetResultsByQuiz,
  handleDeleteResult,
  handleGetQuizStatistics,
  handleGetUserStatistics,
} = require("../controllers/resultController");

const { adminOnly } = require("../middlewares/authMiddleware");
const { publicCache,privateCache } = require("../config/redis");

const CACHE_2_MIN = 120;

router.post("/submit", handleSubmitQuiz);

router.get("/admin/all", adminOnly, handleGetAllResults);

router.get("/user", handleGetResultsByUser);

router.get(
  "/user/statistics",
  privateCache(60),
  handleGetUserStatistics
);


router.get(
  "/quiz/:quizId/statistics",
  publicCache(CACHE_2_MIN),
  handleGetQuizStatistics
);

router.get(
  "/quiz/:quizId",
  privateCache(CACHE_2_MIN),
  handleGetResultsByQuiz
);

router.get(
  "/leaderboard/:quizId",
  publicCache(CACHE_2_MIN),
  leaderboard
);

router.get("/:id", handleGetResultById);

router.delete("/:id", handleDeleteResult);

module.exports = router;
