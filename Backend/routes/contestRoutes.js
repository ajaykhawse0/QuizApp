const express = require("express");
const {
  handleCreateContest,
  handleGetAllContests,
  handleGetContestById,
  handleJoinContest,
  handleGetContestLeaderboard,
  handleGetMyContests,
  handleUpdateContest,
  handleDeleteContest,
} = require("../controllers/contestController");
const { adminOnly } = require("../middlewares/authMiddleware");
const { cacheMiddleware } = require("../config/redis");

const router = express.Router();

// Cache durations (in seconds)
const CACHE_5_MIN = 300;
const CACHE_1_MIN = 60;
const CACHE_30_SEC = 30;

// Public routes with caching
router.get("/", cacheMiddleware(CACHE_1_MIN), handleGetAllContests);
router.get("/my-contests", handleGetMyContests);
router.get("/:id", cacheMiddleware(CACHE_1_MIN), handleGetContestById);
router.get("/:id/leaderboard", cacheMiddleware(CACHE_30_SEC), handleGetContestLeaderboard);
router.post("/:id/join", handleJoinContest);

// Admin routes
router.post("/create" ,adminOnly, handleCreateContest);
router.put("/:id" ,adminOnly, handleUpdateContest);
router.delete("/:id" ,adminOnly, handleDeleteContest);

module.exports = router;
