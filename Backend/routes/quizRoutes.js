const express = require('express');
const {handleCreateQuiz, handleGetAllQuizes, handleGetQuizById, handleGetUserQuizzes,handleUpdateQuiz,handleDeleteQuiz,handleGetQuizByCategory} = require('../controllers/quizController');
const router = express.Router();
const {adminOnly,protectRoute} = require("../middlewares/authMiddleware");
const {checkQuizEligibility}=require('../middlewares/checkQuizEligibility');
const { publicCache } = require("../config/redis");

// Cache durations
const CACHE_5_MIN = 300;

//Completed Routes
router.post('/createquiz',protectRoute,adminOnly, handleCreateQuiz);
router.get('/quizzes', publicCache(CACHE_5_MIN), handleGetAllQuizes);
router.get('/quizzes/:id',protectRoute,checkQuizEligibility,handleGetQuizById);
router.get('/admin/quizzes',protectRoute,handleGetUserQuizzes);
router.put('/update/:id', protectRoute, adminOnly, handleUpdateQuiz);

router.post('/delete/:id', protectRoute,adminOnly,handleDeleteQuiz);
router.get('/category/:categoryname', publicCache(CACHE_5_MIN), handleGetQuizByCategory);

module.exports = router;