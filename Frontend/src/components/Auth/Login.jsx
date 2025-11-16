import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authAPI } from '../../services/api';
import GoogleLoginButton from './GoogleLoginButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(''); // For forgot password
  const [forgotMode, setForgotMode] = useState(false); // Toggle forgot-password form
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) navigate('/');
    else setError(result.message);

    setLoading(false);
  };

  


const handleForgotPassword = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
   
    const response = await authAPI.forgotPassword({ email: forgotEmail });

    if (response?.data?.message) {
      
      alert(response.data.message);
    } else {
      alert('Password reset link sent successfully. Check your email.');
    navigate("https://mail.google.com");

 
    setForgotEmail('');
    }

    setForgotEmail(''); 
  } catch (err) {
    console.error('Forgot Password Error:', err);


    setError(
      err.response?.data?.message || 
      'Failed to send reset link. Please try again later.'
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8 
                    bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 
                    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 
                    transition-colors duration-500">
      <div className="w-full max-w-md backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 
                      border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-8 
                      space-y-8 transform transition-transform duration-300 hover:scale-[1.02]">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {forgotMode ? 'Reset your password' : 'Welcome Back 👋'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {forgotMode ? (
              <>
                Enter your email below to receive a reset link.
              </>
            ) : (
              <>
                Sign in to continue or{' '}
                <Link
                  to="/signup"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                  create an account
                </Link>
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-sm text-sm">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {!forgotMode ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-3 text-gray-500 dark:text-gray-400"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                               dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                               transition"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-3 text-gray-500 dark:text-gray-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                               dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                               transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Forgot password toggle */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white 
                           bg-gradient-to-r from-primary-600 to-primary-700 
                           hover:from-primary-700 hover:to-primary-800
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg hover:shadow-primary-500/30
                           transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 py-2">or </p>
           
            <GoogleLoginButton />
          </form>
     
        ) : (
          // 🔹 Forgot Password Form
          <form className="space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label
                htmlFor="forgotEmail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Enter your email
              </label>
              <input
                id="forgotEmail"
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                           transition"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white 
                         bg-gradient-to-r from-primary-600 to-primary-700 
                         hover:from-primary-700 hover:to-primary-800
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg hover:shadow-primary-500/30
                         transition-all duration-300"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="text-sm mt-3 text-gray-600 dark:text-gray-300 hover:underline"
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
