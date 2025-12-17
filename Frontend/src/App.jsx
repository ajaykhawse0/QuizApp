import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import QuizList from "./components/Quiz/QuizList";
import TakeQuiz from "./components/Quiz/TakeQuiz";
import ResultsList from "./components/Results/ResultsList";
import ResultDetail from "./components/Results/ResultDetail";
import UserStatistics from "./components/Statistics/UserStatistics";
import Leaderboard from "./components/Statistics/Leaderboard";
import LeaderboardList from "./components/Statistics/LeaderboardList";
import ProgressTracking from "./components/Progress/ProgressTracking";
import AdminDashboard from "./components/Admin/AdminDashboard";
import CreateQuiz from "./components/Admin/CreateQuiz";
import ResetPassword from "./components/Auth/ResetPassword";
import UploadProfile from "./components/Profile/UploadProfile";
import ProfilePage from "./components/Profile/ProfilePage";
import UpdateQuiz from "./components/Admin/UpdateQuiz";
import SuperAdminPanel from "./components/SuperAdmin/SuperAdminPanel";
import ContestList from "./components/Contest/ContestList";
import ContestDetail from "./components/Contest/ContestDetail";
import ContestLeaderboard from "./components/Contest/ContestLeaderboard";
import CreateContest from "./components/Contest/CreateContest";
import MyContests from "./components/Contest/MyContests";
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <Layout>
            <QuizList />
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout>
            <ProfilePage/>
          </Layout>
        }
      />

      <Route
        path="/quiz/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TakeQuiz />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload-profile"
        element={
         
            <Layout>
              <UploadProfile />
            </Layout>

        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <Layout>
              <ResultsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/result/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ResultDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <Layout>
              <UserStatistics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Layout>
              <ProgressTracking />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Layout>
              <LeaderboardList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard/:quizId"
        element={
          <ProtectedRoute>
            <Layout>
              <Leaderboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <CreateQuiz />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/superadmin/panel"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <SuperAdminPanel />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/update/:id"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <UpdateQuiz />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/reset-password/:token" 
      element={
        <Layout>
      <ResetPassword />
      </Layout>
      } />

      {/* Contest Routes */}
      <Route
        path="/contests"
        element={
          <ProtectedRoute>
            <Layout>
              <ContestList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contests/create"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <CreateContest />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contests/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ContestDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contests/:id/leaderboard"
        element={
          <ProtectedRoute>
            <Layout>
              <ContestLeaderboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-contests"
        element={
          <ProtectedRoute>
            <Layout>
              <MyContests />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
