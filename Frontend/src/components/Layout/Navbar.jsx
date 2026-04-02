import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon, Menu, X, User as UserIcon } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  // Helper styles
  const getLinkStyle = (path) => {
    const active = isActive(path);
    return `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
        : "text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
    }`;
  };

  const getMobileLinkStyle = (path) => {
    const active = isActive(path);
    return `block w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
      active
        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border-l-4 border-primary-500"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-transparent"
    }`;
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <span className="text-xl font-bold leading-none -mt-px">Q</span>
              </div>
              Quizify
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/" className={getLinkStyle("/")}>
                Quizzes
              </Link>
              {user && (
                <>
                  <Link to="/contests" className={getLinkStyle("/contests")}>
                    Contests
                  </Link>
                  <Link to="/results" className={getLinkStyle("/results")}>
                    Results
                  </Link>
                  <Link to="/leaderboard" className={getLinkStyle("/leaderboard")}>
                    Leaderboard
                  </Link>
                  <Link to="/statistics" className={getLinkStyle("/statistics")}>
                    Stats
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className={getLinkStyle("/admin")}>
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Auth Buttons / Profile */}
            {user ? (
              <>
                {/* Profile Dropdown */}
                <div ref={dropdownRef} className="relative hidden md:block">
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center focus:outline-none"
                  >
                    <img
                      src={user?.profilePicture || "https://ui-avatars.com/api/?name=" + user.name + "&background=6366f1&color=fff"}
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent hover:ring-primary-500/50 transition-all duration-200"
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-soft-lg border border-gray-100 dark:border-gray-800 py-2 z-50 transform origin-top-right transition-all">
                      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-5 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        Profile & Settings
                      </Link>
                      <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 -mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="hidden sm:inline-block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm shadow-primary-500/20 hover:shadow-primary-500/40"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 py-2 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileLinkStyle("/")}
          >
            Quizzes
          </Link>
          {user ? (
            <>
              <Link
                to="/contests"
                onClick={() => setMobileMenuOpen(false)}
                className={getMobileLinkStyle("/contests")}
              >
                Contests
              </Link>
              <Link
                to="/results"
                onClick={() => setMobileMenuOpen(false)}
                className={getMobileLinkStyle("/results")}
              >
                Results
              </Link>
              <Link
                to="/statistics"
                onClick={() => setMobileMenuOpen(false)}
                className={getMobileLinkStyle("/statistics")}
              >
                Statistics
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className={getMobileLinkStyle("/leaderboard")}
              >
                Leaderboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={getMobileLinkStyle("/admin")}
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={getMobileLinkStyle("/profile")}
              >
                Profile & Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={getMobileLinkStyle("/login")}
            >
              Log in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
