const express = require('express');
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
    handleGetUserStatistics
} = require('../controllers/resultController');
const { adminOnly } = require('../middlewares/authMiddleware');
const { cacheMiddleware } = require("../config/redis");

// Cache durations
const CACHE_2_MIN = 120;
const CACHE_1_MIN = 60;

// Submit quiz result
router.post('/submit', handleSubmitQuiz);


router.get('/admin/all', adminOnly, handleGetAllResults);


router.get('/user', cacheMiddleware(CACHE_1_MIN), handleGetResultsByUser);


// user statistics
router.get('/user/statistics', cacheMiddleware(CACHE_2_MIN), handleGetUserStatistics);

// Get quiz statistics/analytics )
router.get('/quiz/:quizId/statistics', cacheMiddleware(CACHE_2_MIN), handleGetQuizStatistics);

// Get results by quiz ID 
router.get('/quiz/:quizId', cacheMiddleware(CACHE_2_MIN), handleGetResultsByQuiz);

// Leaderboard for a quiz (top 10)
router.get('/leaderboard/:quizId', cacheMiddleware(CACHE_1_MIN), leaderboard);

// Get specific result by ID 
router.get('/:id', cacheMiddleware(CACHE_2_MIN), handleGetResultById);

// Delete result 
router.delete('/:id', handleDeleteResult);

module.exports = router;