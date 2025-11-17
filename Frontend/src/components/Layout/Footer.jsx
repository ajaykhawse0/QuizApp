import { Link } from 'react-router-dom';
import { Github, Mail, Linkedin, Twitter, Heart, BookOpen, Trophy, User } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400 "
            >
              QuizApp
            </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Test your knowledge with our comprehensive collection of quizzes. 
              Learn, compete, and track your progress.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/ajaykhawse0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/ajay-khawse-b4226129b/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/AjayKhawse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:ajaykhawse2006@gmail.com"
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Browse Quizzes
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  to="/statistics"
                  className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  My Statistics
                </Link>
              </li>
              <li>
                <Link
                  to="/results"
                  className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  My Results
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          {/* <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                >
                  How to Play
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div> */}

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:ajaykhawse2006@gmail.com"
                  className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors break-all"
                >
                  ajaykhawse2006@gmail.com
                </a>
              </div>
              <div className="text-sm text-gray-600  dark:text-gray-400">
                <p className="font-medium text-gray-900 dark:text-white mb-1 mt-4">
                  Found a bug?
                </p>
                <a
                  href="https://github.com/ajaykhawse0/QuizApp/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  Report on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>

        
        

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
            <p className="flex items-center justify-center md:justify-start gap-1">
              © {currentYear} Quiz App. Made with{' '}
              <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
              by{' '}
              <a
                href="https://github.com/ajaykhawse0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
              >
                Ajay Khawse
              </a>
            </p>
          </div>
        </div>


      </div>
    </footer>
  );
};

export default Footer;
