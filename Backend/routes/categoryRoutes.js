const express= require('express');
const router= express.Router();
const {handleCreateCategory, handleGetAllCategories}= require('../controllers/categoryController');
const {adminOnly}= require("../middlewares/authMiddleware");
//Create Category
router.post('/',adminOnly, handleCreateCategory);
router.get('/', handleGetAllCategories);

module.exports= router;