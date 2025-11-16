
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Google OAuth entry point
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback URL
router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure",
    session: true,
  }),
  async (req, res) => {
    // User is available on req.user (from deserializeUser)
    const user = req.user;

    // Generate JWT (same payload as your normal login)
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "168h" } // 7 days
    );

    // Set JWT cookie (same as your normal login)
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const redirectURL = `${process.env.CLIENT_URL}?token=${token}`;

    return res.redirect(redirectURL);

  }
);

// Failure route (optional)
router.get("/failure", (req, res) => {
  return res.status(401).json({ message: "Google Login Failed" });
});

module.exports = router;
