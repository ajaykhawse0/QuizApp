const express = require("express");

const {
  handleCreateAccount,
  handleLoginAccount,
  handleLogout,
  handleGetCurrentUser,
  handleChangePassword,
  handleForgetPassword,
  handleResetPassword
} = require("../controllers/authController");

const { protectRoute } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/createaccount", handleCreateAccount);
router.post("/login", handleLoginAccount);
router.post("/logout", handleLogout);
router.get("/me", protectRoute, handleGetCurrentUser);
router.post("/change-password", protectRoute, handleChangePassword);
router.post("/forgot-password", handleForgetPassword);
router.post("/forgot-password/reset-password/:token", handleResetPassword);

module.exports = router;
