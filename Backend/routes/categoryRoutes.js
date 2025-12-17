const express= require('express');
const router= express.Router();
const {handleCreateCategory, handleGetAllCategories}= require('../controllers/categoryController');
const {adminOnly}= require("../middlewares/authMiddleware");
const { cacheMiddleware } = require("../config/redis");

// Cache duration - 10 minutes for categories (rarely change)
const CACHE_10_MIN = 600;

//Create Category
router.post('/',adminOnly, handleCreateCategory);
router.get('/', cacheMiddleware(CACHE_10_MIN), handleGetAllCategories);

module.exports= router;