const express = require('express');
const {handleCreateQuiz, handleGetAllQuizes, handleGetQuizById, handleGetUserQuizzes,handleUpdateQuiz,handleDeleteQuiz,handleGetQuizByCategory} = require('../controllers/quizController');
const router = express.Router();
const {adminOnly,protectRoute} = require("../middlewares/authMiddleware");
const {checkQuizEligibility}=require('../middlewares/checkQuizEligibility');
//Completed Routes
router.post('/createquiz',protectRoute,adminOnly, handleCreateQuiz);
router.get('/quizzes', handleGetAllQuizes);
router.get('/quizzes/:id',protectRoute,checkQuizEligibility,handleGetQuizById);
router.get('/admin/quizzes',protectRoute,handleGetUserQuizzes);
router.put('/update/:id', protectRoute, adminOnly, handleUpdateQuiz);

router.post('/delete/:id', protectRoute,adminOnly,handleDeleteQuiz);
router.get('/category/:categoryname', handleGetQuizByCategory);

module.exports = router;