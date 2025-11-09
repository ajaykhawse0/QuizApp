const bcrypt = require("bcrypt");
const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");
const dns = require("dns");
const nodemailer = require("nodemailer");
const saltRounds = 12;
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL||"http://localhost:3000";

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
        profilePicture:user.profilePicture,
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
      return res.status(400).json({
        message: "Please provide a email",
      });
    }
    const user = await UserModel.findOne({ email: email });

    
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    // Now we generate a token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,

      auth: {
        user: process.env.ADMIN_GMAIL,
        pass: process.env.ADMIN_PASS,
      },
    });

    const resetLink = `${CLIENT_URL}reset-password/${token}`;
    const reciever = {
      from: `"Quiz App Support" <${process.env.ADMIN_GMAIL}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family:Arial,sans-serif; line-height:1.5;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name || "User"},</p>
          <p>We received a request to reset your password. Click the link below to reset it:</p>
          <a href="${resetLink}" 
             style="display:inline-block; padding:10px 15px; background-color:#4f46e5; color:white; 
                    text-decoration:none; border-radius:6px;">
             Reset Password
          </a>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn’t request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(reciever);
    return res.status(200).json({
      message:
        "Password Reset link Sent Successfully to your Email It will Expire in 10 minutes",
    });
  } catch (err) {
    console.error("Error in forget password:", err);
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
    user.passwordLength=passLength;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } 
  
  catch (e) {
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
