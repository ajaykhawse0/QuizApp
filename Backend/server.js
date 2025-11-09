const express = require("express");
const cors = require("cors");
 const cookieParser = require("cookie-parser");
const connectDB = require("./connection");
const authRouter = require("./routes/authRoutes");
const quizRouter = require("./routes/quizRoutes");
const resultRouter = require("./routes/resultRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const profileRouter = require("./routes/profileRoutes");
const superAdminRouter = require('./routes/superadminRoutes');
const {protectRoute} = require("./middlewares/authMiddleware");
const PORT = 5000;
const app = express();
const dotenv = require("dotenv");
dotenv.config();  

// CORS configuration - must specify origin when using credentials
const corsOptions = {
  origin: [process.env.CORS_ORIGIN],
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 
};

//Midleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//Routes

app.use('/api/auth',authRouter);
app.use('/api/quiz',quizRouter);
app.use('/api/result',protectRoute,resultRouter);
app.use('/api/categories',protectRoute,categoryRouter);
app.use('/api/profile',profileRouter);
app.use('/api/superadmin',protectRoute,superAdminRouter);


const MONGO_DB_URL = process.env.MONGO_URI;



connectDB(MONGO_DB_URL);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});