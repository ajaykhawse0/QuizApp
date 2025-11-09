import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resultAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const ResultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await resultAPI.getById(id);
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load result');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    if (percentage >= 70) return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    if (percentage >= 50) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !result) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error || 'Result not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/results')}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4 flex items-center"
        >
          ← Back to Results
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {result.quiz?.title || 'Quiz Result'}
        </h1>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
              {result.score}/{result.total}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Score</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl md:text-3xl font-bold ${
              result.percentage >= 90 ? 'text-green-600 dark:text-green-400' : 
              result.percentage >= 70 ? 'text-blue-600 dark:text-blue-400' : 
              result.percentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 
              'text-red-600 dark:text-red-400'
            }`}>
              {result.percentage.toFixed(1)}%
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Percentage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-300">
              {formatTime(result.timeTaken)}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Time Taken</div>
          </div>
          <div className="text-center">
            <div className={`text-sm md:text-lg font-semibold px-2 md:px-3 py-1 rounded-full inline-block ${getScoreColor(result.percentage)}`}>
              {result.percentage >= 90 ? 'Excellent' : result.percentage >= 70 ? 'Good' : result.percentage >= 50 ? 'Average' : 'Needs Improvement'}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">Grade</div>
          </div>
        </div>
      </div>

      {/* Question Breakdown */}
      {result.questionBreakdown && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">Question Breakdown</h2>
          <div className="space-y-4 md:space-y-6">
            {result.questionBreakdown.map((q, index) => (
              <div
                key={index}
                className={`border-l-4 p-4 rounded ${
                  q.isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                    Question {q.questionNumber}: {q.question}
                  </h3>
                  {q.isCorrect ? (
                    <span className="bg-green-500 dark:bg-green-600 text-white px-2 py-1 rounded text-xs md:text-sm font-medium">
                      Correct
                    </span>
                  ) : (
                    <span className="bg-red-500 dark:bg-red-600 text-white px-2 py-1 rounded text-xs md:text-sm font-medium">
                      Incorrect
                    </span>
                  )}
                </div>
                <div className="space-y-2 mt-3">
                  <div className="text-xs md:text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-200">Your Answer:</span>{' '}
                    <span className={q.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                      {q.options[q.userAnswer] || 'Not answered'}
                    </span>
                  </div>
                  {!q.isCorrect && (
                    <div className="text-xs md:text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-200">Correct Answer:</span>{' '}
                      <span className="text-green-700 dark:text-green-300">
                        {q.options[q.correctAnswer]}
                      </span>
                    </div>
                  )}
                  {q.explanation && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs md:text-sm text-blue-900 dark:text-blue-200">
                      <span className="font-medium">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDetail;

