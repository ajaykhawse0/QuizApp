import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams(); 


   const validatePassword = (password) => {
    if (password.length < 8 || password.length > 24) {
      return 'Password must be 8–24 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return '';
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setMessage('');
  

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
setLoading(true);
  try {
    const res = await authAPI.resetPassword(token, { newPassword });

    if (res.data?.message) {
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setError('Unexpected response from server.');
    }
  } catch (err) {
    console.error('Reset Password Error:', err);
    setError(err.response?.data?.message || 'Something went wrong.');
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
            Reset Your Password 🔑
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your new password below to reset your account.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-sm text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg shadow-sm text-sm">
            {message}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                           transition pr-10"
                placeholder="Enter new password"
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                         transition"
              placeholder="Confirm new password"
            />
          </div>

          {/* Submit */}
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
