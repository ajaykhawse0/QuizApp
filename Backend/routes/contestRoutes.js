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
const { publicCache } = require("../config/redis");

const router = express.Router();

// Cache durations
const CACHE_5_MIN = 300;
const CACHE_1_MIN = 60;
const CACHE_30_SEC = 30;

// Public routes (cached)
router.get("/", publicCache(CACHE_5_MIN), handleGetAllContests);
router.get("/:id", publicCache(CACHE_1_MIN), handleGetContestById);
router.get("/:id/leaderboard", publicCache(CACHE_30_SEC), handleGetContestLeaderboard);

// User-specific (no cache)
router.get("/my-contests", handleGetMyContests);
router.post("/:id/join", handleJoinContest);

// Admin (no cache)
router.post("/create", adminOnly, handleCreateContest);
router.put("/:id", adminOnly, handleUpdateContest);
router.delete("/:id", adminOnly, handleDeleteContest);

module.exports = router;
