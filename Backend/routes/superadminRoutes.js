const {superAdminOnly}=require('../middlewares/authMiddleware');
const{handleGetAllUser,handleRoles,handleDeleteUser}= require('../controllers/superAdminController');
const express = require('express');
const router = express.Router();

router.get('/users',superAdminOnly,handleGetAllUser);
router.patch('/roles/:id',superAdminOnly,handleRoles);
router.delete('/delete/:id',superAdminOnly,handleDeleteUser);

module.exports=router;