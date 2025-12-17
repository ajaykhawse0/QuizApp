const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const { rateLimit } = require("express-rate-limit");
const dotenv = require("dotenv");

const connectDB = require("./connection");
const { connectRedis } = require("./config/redis");

const authRouter = require("./routes/authRoutes");
const googleAuthRouter = require("./routes/googleAuthRoutes");
const quizRouter = require("./routes/quizRoutes");
const resultRouter = require("./routes/resultRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const profileRouter = require("./routes/profileRoutes");
const superAdminRouter = require("./routes/superadminRoutes");
const contestRouter = require("./routes/contestRoutes");

const { protectRoute } = require("./middlewares/authMiddleware");

require("./config/google");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Trust proxy (required for rate-limit + deployments behind proxies)
 */
app.set("trust proxy", 1);

/**
 * CORS configuration
 */
const corsOptions = {
  origin: [process.env.CORS_ORIGIN],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

/**
 * Rate limiter
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

//Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * Session configuration
 * (MemoryStore fallback if Redis is unavailable)
 */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);


 // Passport
 
app.use(passport.initialize());
app.use(passport.session());


 //Rate limiting
 
app.use(limiter);

/**
 * Routes
 */
app.use("/api/auth", authRouter);
app.use("/api/auth/google", googleAuthRouter);

app.use("/api/quiz", quizRouter);
app.use("/api/result", protectRoute, resultRouter);
app.use("/api/categories", protectRoute, categoryRouter);
app.use("/api/profile", protectRoute, profileRouter);
app.use("/api/superadmin", protectRoute, superAdminRouter);
app.use("/api/contests", protectRoute, contestRouter);

/**
 * Database connections
 */
const MONGO_DB_URL = process.env.MONGO_URI;
connectDB(MONGO_DB_URL);

/**
 * Redis connection (optional)
 */
connectRedis().catch(() => {
  console.log("Redis not available, continuing without cache");
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
