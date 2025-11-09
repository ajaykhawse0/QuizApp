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

// Submit quiz result
router.post('/submit', handleSubmitQuiz);


router.get('/admin/all', adminOnly, handleGetAllResults);


router.get('/user', handleGetResultsByUser);


// user statistics
router.get('/user/statistics', handleGetUserStatistics);

// Get quiz statistics/analytics )
router.get('/quiz/:quizId/statistics', handleGetQuizStatistics);

// Get results by quiz ID 
router.get('/quiz/:quizId', handleGetResultsByQuiz);

// Leaderboard for a quiz (top 10)
router.get('/leaderboard/:quizId', leaderboard);

// Get specific result by ID 
router.get('/:id', handleGetResultById);

// Delete result 
router.delete('/:id', handleDeleteResult);

module.exports = router;