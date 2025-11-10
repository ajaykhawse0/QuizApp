const bcrypt = require("bcrypt");
const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const saltRounds =12;

// -------------------- SIGNUP --------------------
async function handleCreateAccount(req, res) {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const domain = email.split("@")[1];
    dns.resolveMx(domain, (err, add) => {
      if (err) {
        return res.status(400).json({
          message: "Enter a valid email address",
          error: err,
        });
      }
    });

    if (!password || password.length < 8 || password.length > 24) {
      return res
        .status(400)
        .json({ error: "Password must be 8–24 characters long" });
    }

    if (!/[A-Z]/.test(password)) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one uppercase letter" });
    }

    if (!/[a-z]/.test(password)) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one lowercase letter" });
    }

    if (!/[0-9]/.test(password)) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one number" });
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({
        error:
          "Password must contain at least one special character (!@#$%^&*)",
      });
    }

    const passLength = password.length;
    // Hash password
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      passwordLength: passLength,
    });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: "1h" });

    // Store token in cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.status(201).json({
      message: "Account Created Successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Error creating account:", err);
    return res.status(500).json({ message: "Server Error" });
  }
}

// -------------------- LOGIN --------------------
async function handleLoginAccount(req, res) {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign(
      { email: user.email, userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "168h" }
    );

    // Store JWT in cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("Error logging in:", err);
    return res.status(500).json({ message: "Server Error" });
  }
}

// -------------------- GET CURRENT USER --------------------
async function handleGetCurrentUser(req, res) {
  try {
    const user = req.user;
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("Error fetching current user:", err);
    return res.status(500).json({ message: "Server Error" });
  }
}

// -------------------- LOGOUT --------------------
async function handleLogout(req, res) {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Error during logout:", err);
    return res.status(500).json({ message: "Server Error" });
  }
}

//----------------Handle forget password-------------

async function handleForgetPassword(req, res) {
  try {
    const { email } = req.body;

    
    if (!email) {
      return res.status(400).json({ message: "Please provide an email" });
    }

   
    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY is not set in environment variables");
      return res.status(500).json({ message: "Email service configuration error" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token (expires in 10 min)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    const resetLink = `${CLIENT_URL}reset-password/${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">Password Reset Request</h2>
        <p>Hi ${user.name || "User"},</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <a href="${resetLink}" 
           style="display:inline-block; padding:10px 18px; background-color:#4f46e5; color:#fff; 
                  border-radius:6px; text-decoration:none; font-weight:bold;">
           Reset Password
        </a>
        <p>This link will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <br />
        <p>– The Quiz App Team</p>
      </div>
    `;

 
    const brevoResponse = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { 
          name: "Quiz App Support", 
          email: ADMIN_EMAIL 
        },
        to: [{ email }],
        subject: "Password Reset Request",
        htmlContent: html,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,  
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent successfully via Brevo:", brevoResponse.data);

    return res.status(200).json({
      message: "Password reset link sent successfully! It expires in 10 minutes.",
    });

  } catch (err) {
    console.error("Error in forget password:", err.response?.data || err.message);
    
  
    if (err.response?.status === 401) {
      return res.status(500).json({
        message: "Email service authentication failed. Please contact support.",
      });
    }
    
    return res.status(500).json({
      message: "Error processing forgot password request",
      error: err.message,
    });
  }
}
//--Handle Change Password--

async function handleChangePassword(req, res) {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedNewPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    return res.status(500).json({ message: "Server Error" });
  }
}

//------------Reset Password--------------------
async function handleResetPassword(req, res) {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        message: "Token Not provided ",
      });
    }
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({
        message: "Please Provide a new Password",
      });
    }

    const decode = jwt.verify(token, JWT_SECRET);

    const user = await UserModel.findOne({ email: decode.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!newPassword || newPassword.length < 8 || newPassword.length > 24) {
      return res
        .status(400)
        .json({ error: "Password must be 8–24 characters long" });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one uppercase letter" });
    }

    if (!/[a-z]/.test(newPassword)) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one lowercase letter" });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one number" });
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({
        error:
          "Password must contain at least one special character (!@#$%^&*)",
      });
    }

    const passLength = newPassword.length;

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedNewPassword;
    user.passwordLength = passLength;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (e) {
    console.error("Error in reset password:", e);
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Reset link has expired" });
    }

    return res.status(500).json({
      message: "Internal Server Error in reset password",
      error: e.message,
    });
  }
}

module.exports = {
  handleCreateAccount,
  handleLoginAccount,
  handleLogout,
  handleGetCurrentUser,
  handleChangePassword,
  handleForgetPassword,
  handleResetPassword,
};
