import { Link } from 'react-router-dom';
import { Clock, HelpCircle, CheckCircle, ChevronRight, User } from 'lucide-react';

const QuizCard = ({ quiz }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'hard':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl p-6 transition-all duration-300 hover:shadow-soft-xl border border-gray-100 dark:border-gray-800 flex flex-col h-full">
      <div className="flex items-start justify-between mb-5 gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
          {quiz.title}
        </h3>
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium tracking-wide flex-shrink-0 ${getDifficultyColor(quiz.difficulty)}`}>
          {quiz.difficulty?.toUpperCase() || 'MEDIUM'}
        </span>
      </div>
      
      {quiz.category && (
        <div className="mb-5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            {quiz.category}
          </span>
        </div>
      )}

      {/* spacer to push footer down */}
      <div className="flex-1"></div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>{quiz.questionCount || quiz.questions?.length || 0} Questions</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>{formatTime(quiz.timeLimit || 300)}</span>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="truncate">By {quiz.createdBy || 'Admin'}</span>
        </div>
      </div>

      <Link
        to={`/quiz/${quiz.id}`}
        className="flex items-center justify-center w-full gap-2 bg-gray-50 hover:bg-primary-600 text-gray-900 hover:text-white dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-primary-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300"
      >
        Take Quiz
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default QuizCard;

