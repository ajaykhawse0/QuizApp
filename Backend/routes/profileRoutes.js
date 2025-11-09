const {upload} = require('../middlewares/multer.middleware');
const {handleProfilePic,handleGetProfile,handleUpdateProfile} = require('../controllers/profileController');
const {protectRoute} = require("../middlewares/authMiddleware");
const express = require('express');
const router = express.Router();

router.post('/upload/profile-pic',protectRoute,upload.single('file'), handleProfilePic);
router.post('/update/profile',protectRoute,upload.single('file'), handleUpdateProfile);
router.get('/',protectRoute,handleGetProfile);



module.exports = router;