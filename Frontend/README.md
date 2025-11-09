# Quiz App Frontend

A modern React-based frontend for the Quiz App, built with Vite, React Router, and Tailwind CSS.

## Features

- 🎯 **User Authentication** - Login and Signup with JWT tokens
- 📝 **Quiz Taking** - Interactive quiz interface with timer
- 📊 **Results & Statistics** - View detailed results and performance statistics
- 🏆 **Leaderboards** - See top performers
- 👨‍💼 **Admin Dashboard** - Create and manage quizzes (admin only)
- 📱 **Responsive Design** - Beautiful UI that works on all devices

## Tech Stack

- **React 18** - UI library
- **React Router** - Navigation
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend server running on `http://localhost:5000`

### Installation

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── Admin/          # Admin components
│   │   ├── Auth/           # Login/Signup
│   │   ├── Common/         # Shared components
│   │   ├── Layout/         # Layout components
│   │   ├── Quiz/           # Quiz components
│   │   ├── Results/        # Results components
│   │   └── Statistics/     # Statistics components
│   ├── context/            # React Context (Auth)
│   ├── services/           # API service layer
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`. All API calls are centralized in `src/services/api.js`.

### Authentication

- POST `/api/auth/createaccount` - Sign up
- POST `/api/auth/login` - Log in
- POST `/api/auth/logout` - Log out

### Quizzes

- GET `/api/quiz/quizzes` - Get all published quizzes
- GET `/api/quiz/user/quizzes` - Get user's quizzes (admin)
- POST `/api/quiz/createquiz` - Create quiz (admin)
- POST `/api/quiz/delete/:id` - Delete quiz (admin)

### Results

- POST `/api/result/submit` - Submit quiz result
- GET `/api/result/user` - Get user's results
- GET `/api/result/user/statistics` - Get user statistics
- GET `/api/result/:id` - Get result details
- GET `/api/result/leaderboard/:quizId` - Get leaderboard

## Environment Configuration

The API base URL is configured in `src/services/api.js`. To change it, modify:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Notes

- The app uses JWT tokens stored in localStorage for authentication
- All protected routes require authentication
- Admin routes require admin role
- Cookies are used for session management (withCredentials: true)

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure:
1. Backend CORS is configured to allow `http://localhost:3000`
2. `withCredentials: true` is set in axios config

### Authentication Issues

- Clear localStorage if tokens are stale
- Check that backend is running on port 5000
- Verify JWT token format in browser dev tools

