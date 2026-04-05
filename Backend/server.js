const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const { rateLimit } = require("express-rate-limit");
const dotenv = require("dotenv");
const http = require("http");
const https = require("https");

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
  origin: process.env.CORS_ORIGIN.split(",").map(s => s.trim()),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

/**
 * Rate limiters
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: "Too many auth requests from this IP, please try again later.",
});

const contestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2500,
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
 
app.use("/api", apiLimiter);

/**
 * Routes
 */
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/auth/google", googleAuthRouter);

app.use("/api/quiz", quizRouter);
app.use("/api/result", protectRoute, resultRouter);
app.use("/api/categories", protectRoute, categoryRouter);
app.use("/api/profile", protectRoute, profileRouter);
app.use("/api/superadmin", protectRoute, superAdminRouter);
app.use("/api/contests", contestLimiter, protectRoute, contestRouter);

// Health endpoint for uptime pings (helps reduce free-tier cold starts)
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

/**
 * Database connections
 */
const MONGO_DB_URL = process.env.MONGO_URI;
connectDB(MONGO_DB_URL);

/**
 * Redis connection (optional)
 */
connectRedis().catch(() => {
  // Redis is optional for this app; continue without cache.
});

/**
 * Optional keep-alive ping.
 * Set KEEP_ALIVE_URL to your deployed /api/health endpoint.
 */
const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL;
const KEEP_ALIVE_INTERVAL_MS =
  Number(process.env.KEEP_ALIVE_INTERVAL_MS) || 14 * 60 * 1000;

if (KEEP_ALIVE_URL) {
  setInterval(() => {
    try {
      const lib = KEEP_ALIVE_URL.startsWith("https") ? https : http;
      const req = lib.get(KEEP_ALIVE_URL, (res) => {
        res.resume();
      });
      req.on("error", () => {});
      req.setTimeout(10000, () => req.destroy());
    } catch (_) {}
  }, KEEP_ALIVE_INTERVAL_MS);
}

/**
 * Start server
 */
app.listen(PORT);
