const express = require("express");
const cors = require("cors");
 const cookieParser = require("cookie-parser");
const connectDB = require("./connection");
const { connectRedis } = require("./config/redis");
const authRouter = require("./routes/authRoutes");
const googleAuthRouter = require("./routes/googleAuthRoutes");
const quizRouter = require("./routes/quizRoutes");
const resultRouter = require("./routes/resultRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const profileRouter = require("./routes/profileRoutes");
const superAdminRouter = require('./routes/superadminRoutes');
const contestRouter = require('./routes/contestRoutes');
const session = require("express-session");
const passport = require("passport");
const {rateLimit} = require('express-rate-limit');
require("./config/google");
const {protectRoute} = require("./middlewares/authMiddleware");
const app = express();
const dotenv = require("dotenv");
dotenv.config();  
const PORT = process.env.PORT || 5000;

// CORS configuration - must specify origin when using credentials
const corsOptions = {
  origin: [process.env.CORS_ORIGIN],
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 
};


const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	message: 'Too many requests from this IP, please try again after 15 minutes.',
})




//Midleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(limiter);

//Routes

app.use('/api/auth',authRouter);
app.use('/api/auth/google',googleAuthRouter);
app.use('/api/quiz',quizRouter);
app.use('/api/result',protectRoute,resultRouter);
app.use('/api/categories',protectRoute,categoryRouter);
app.use('/api/profile',profileRouter);
app.use('/api/superadmin',protectRoute,superAdminRouter);
app.use('/api/contests',protectRoute, contestRouter);


const MONGO_DB_URL = process.env.MONGO_URI;

// Connect to MongoDB
connectDB(MONGO_DB_URL);

// Connect to Redis (optional - app works without it)
connectRedis().catch(err => {
  console.log('⚠️  Redis not available, continuing without cache');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});