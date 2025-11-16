import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react'; 
import GoogleLoginButton from './GoogleLoginButton';
const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();


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

   const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

      if (!name.trim() || !email.trim() || !password.trim()) {
    setError('All fields are required');
    return;
  }

  if (!validateEmail(email)) {
    setError('Enter a valid email address');
    return;
  }

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password);

  if (result.success) {
  alert("Account created Succesfully")
  navigate("/login");
}
      
    else setError(result.message);

    setLoading(false);
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 
                            text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-sm text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                           transition"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                           transition"
                placeholder="example@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                             transition pr-10"
                  placeholder="Enter Your Password"
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

          {/* Submit Button */}
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
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button></div>
           <p className="text-center text-gray-500 dark:text-gray-400 mb-2">or </p>
           
            <GoogleLoginButton />
           
           
          
        </form>
      </div>
    </div>
  );
};

export default Signup;
