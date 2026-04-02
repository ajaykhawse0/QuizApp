import { Link } from 'react-router-dom';
import { Github, Mail, Linkedin, Twitter, Heart, BookOpen, Trophy, User } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          {/* Brand & About */}
          <div className="space-y-6 lg:col-span-1">
            <Link
              to="/"
              className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <span className="text-xl font-bold leading-none -mt-px">Q</span>
              </div>
              Quizify
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Test your knowledge with our premium collection of quizzes. Learn, compete, and track your progress in a distraction-free environment.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/ajaykhawse0"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/ajay-khawse-b4226129b/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/AjayKhawse"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group"
                >
                  <BookOpen className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  Quizzes
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group"
                >
                  <Trophy className="h-4 w-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  Leaderboard
                </Link>
              </li>
               <li>
                <Link
                  to="/contests"
                  className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group"
                >
                  <Trophy className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  Contests
                </Link>
              </li>
            </ul>
          </div>

          {/* User Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Account
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/profile"
                  className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group"
                >
                  <User className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  Profile details
                </Link>
              </li>
              <li>
                <Link
                  to="/statistics"
                  className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group"
                >
                  <Trophy className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  My Statistics
                </Link>
              </li>
              <li>
                <Link
                  to="/results"
                  className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group"
                >
                  <BookOpen className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  My Results
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Contact & Support
            </h3>
            <div className="space-y-4">
              <a
                href="mailto:ajaykhawse2006@gmail.com"
                className="flex items-center gap-3 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors group p-3 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-transparent hover:border-primary-100 dark:hover:border-primary-900/50"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900">
                  <Mail className="h-4 w-4 text-gray-500 group-hover:text-primary-600" />
                </div>
                Support Email
              </a>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Found a bug?
                </p>
                <a
                  href="https://github.com/ajaykhawse0/QuizApp/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors inline-block"
                >
                  Report on GitHub &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center md:text-left">
            © {currentYear} Quizify. All rights reserved.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1.5">
            Crafted with <Heart className="h-4 w-4 text-red-500 fill-current" /> by{' '}
            <a
              href="https://github.com/ajaykhawse0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 dark:text-gray-300 font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Ajay Khawse
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
