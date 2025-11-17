# 🎯 Quiz App - Full Stack MERN Application

A comprehensive quiz application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring user authentication, quiz management, real-time scoring, and admin dashboard.

![Quiz App Banner](https://img.shields.io/badge/MERN-Stack-blue) ![Node](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18.2-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## ✨ Features

### 🔐 Authentication & Authorization
- User registration with email validation
- Secure login with JWT tokens
- Google Sign-In integration (OAuth 2.0)
- Password reset functionality via email
- Role-based access control (User, Admin, Super Admin)
- Profile management with image upload

### 📝 Quiz Management
- Create, update, and delete quizzes (Admin only)
- Multiple choice questions with 4 options
- Category-based quiz organization
- Quiz eligibility check (7-day cooldown period)
- Time-limited quiz attempts
- Automatic scoring system

### 📊 User Features
- Browse available quizzes by category
- Take quizzes with real-time validation
- View detailed results and answers
- Track quiz history and statistics
- Personal performance analytics
- Leaderboard rankings per quiz

### 👨‍💼 Admin Dashboard
- Create and manage quizzes
- View all quiz submissions
- Monitor user statistics
- Quiz analytics and insights
- User management (Super Admin)

### 🎨 UI/UX
- Modern, responsive design with Tailwind CSS
- Dark mode support
- Loading states and error handling
- Toast notifications
- Mobile-friendly interface
- Smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI library
- **Vite** - Build tool and dev server
- **React Router Dom** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js 5.1** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.19** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Google OAuth 2.0** - Social authentication
- **Cloudinary** - Image hosting
- **Brevo** - Email service
- **Multer** - File upload handling

## 📁 Project Structure

```
QUIZ APP (MINOR)/
├── Backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Custom middleware
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── public/          # Static files
│   ├── .env             # Environment variables
│   ├── server.js        # Entry point
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── components/  # React components
    │   │   ├── Admin/
    │   │   ├── Auth/
    │   │   ├── Common/
    │   │   ├── Layout/
    │   │   ├── Profile/
    │   │   ├── Quiz/
    │   │   ├── Results/
    │   │   └── Statistics/
    │   ├── context/     # React Context API
    │   ├── services/    # API service layer
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    ├── .env
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console account (for OAuth)
- Cloudinary account (for image uploads)
- Brevo account (for email services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ajaykhawse0/QuizApp.git
  
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```

### Environment Variables

#### Backend `.env`
Create a `.env` file in the `Backend` directory:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# CORS & Client URL
CORS_ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000/

# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key
ADMIN_EMAIL=your_admin_email@gmail.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server

```

#### Frontend `.env`
Create a `.env` file in the `Frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Create **OAuth 2.0 Client ID**
5. Add authorized JavaScript origins:
   - `http://localhost:3000`
6. Add authorized redirect URIs:
   - `http://localhost:3000`
7. Copy **Client ID** and **Client Secret**

### Running the Application

1. **Start Backend Server**
   ```bash
   cd Backend
   npm start
   ```
   Server runs on `http://localhost:5000`

2. **Start Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```
   App runs on `http://localhost:3000` (or port shown in terminal)

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/createaccount` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/google-auth` | Google Sign-In | No |
| POST | `/api/auth/logout` | User logout | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/forgot-password/reset-password/:token` | Reset password | No |

### Quiz Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/quiz/quizzes` | Get all quizzes | Yes |
| GET | `/api/quiz/quizzes/:id` | Get quiz by ID | Yes |
| GET | `/api/quiz/category/:categoryname` | Get quizzes by category | Yes |
| POST | `/api/quiz/createquiz` | Create new quiz | Admin |
| PUT | `/api/quiz/update/:id` | Update quiz | Admin |
| DELETE | `/api/quiz/delete/:id` | Delete quiz | Admin |

### Result Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/result/submit` | Submit quiz answers | Yes |
| GET | `/api/result/user` | Get user's results | Yes |
| GET | `/api/result/user/statistics` | Get user statistics | Yes |
| GET | `/api/result/:id` | Get result by ID | Yes |
| GET | `/api/result/leaderboard/:quizId` | Get quiz leaderboard | Yes |

### Category Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | Get all categories | Yes |
| POST | `/api/categories` | Create category | Admin |

### Profile Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile/:userId` | Get user profile | Yes |
| PUT | `/api/profile/update` | Update profile | Yes |
| POST | `/api/profile/upload` | Upload profile picture | Yes |

## 🔒 Security Features

- Password hashing with Bcrypt (12 rounds)
- JWT token-based authentication
- HTTP-only cookies support
- CORS configuration
- Input validation and sanitization
- Protected routes with middleware
- Role-based access control
- Password strength requirements
- Email verification
- SQL injection prevention (MongoDB)

## 🎯 Key Features Explained

### Quiz Eligibility System
Users can only take each quiz once every 7 days. The system tracks:
- Last attempt timestamp
- Next eligible attempt date
- Automatic blocking of early attempts

### Automatic Scoring
- Real-time answer validation
- Percentage calculation
- Correct/incorrect answer tracking
- Detailed result breakdown

### Admin Dashboard
- Create quizzes with multiple questions
- Set quiz categories and difficulty
- Monitor all submissions
- View analytics and statistics

### User Statistics
- Total quizzes taken
- Average score
- Best/worst performances
- Category-wise analytics
- Progress tracking

## 🎨 UI Components

- **Navbar** - Dynamic navigation with theme toggle
- **Quiz Cards** - Beautiful quiz preview cards
- **Result Cards** - Detailed result display
- **Leaderboard** - Ranked user scores
- **Forms** - Validated input forms
- **Modals** - Confirmation dialogs
- **Loading Spinners** - Async operation indicators
- **Toast Notifications** - User feedback

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if MongoDB connection string is correct
- Ensure all environment variables are set
- Verify port 5000 is not in use

**Frontend CORS errors:**
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check if backend server is running

**Google Sign-In not working:**
- Verify `GOOGLE_CLIENT_ID` is set in both frontend and backend
- Check Google Cloud Console credentials
- Ensure authorized origins are configured

**Image upload fails:**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper file format (jpg, png, etc.)

## 📝 Password Requirements

- Minimum 8 characters, maximum 24
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

## 👥 User Roles

- **User** - Can take quizzes, view results, see leaderboards
- **Admin** - Can create/edit/delete quizzes + all user permissions
- **Super Admin** - Can manage users, assign roles + all admin permissions

## 🚧 Future Enhancements

- [ ] Quiz time limits with countdown timer
- [ ] Question difficulty levels
- [ ] Multiplayer quiz mode
- [ ] Quiz sharing functionality
- [ ] Export results as PDF
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Quiz recommendations based on performance
- [ ] Achievement badges
- [ ] Social media integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Ajay Khawse**
- GitHub: [@ajaykhawse0](https://github.com/ajaykhawse0)
- Email: ajaykhawse2006@gmail.com

## 🙏 Acknowledgments

- [MongoDB](https://www.mongodb.com/) - Database
- [Express.js](https://expressjs.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [Node.js](https://nodejs.org/) - Runtime environment
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Cloudinary](https://cloudinary.com/) - Image hosting
- [Google Identity Services](https://developers.google.com/identity) - OAuth authentication

---

⭐ **Star this repository if you found it helpful!**

Made with ❤️ by Ajay Khawse
