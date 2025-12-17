import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { quizAPI, resultAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { useRef } from 'react';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const contestId = searchParams.get('contestId');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const didRun = useRef(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (quiz && !startTime) {
      setTimeLeft(quiz.timeLimit);
      setStartTime(Date.now());
      setAnswers(new Array(quiz.questions.length).fill(null));
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft > 0 && startTime) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, startTime]);

  // Warning and auto-submit on page unload, refresh, or back navigation
  useEffect(() => {
    if (!quiz || !startTime) return;

    // Function to handle beforeunload (refresh, close tab)
    const handleBeforeUnload = (e) => {
      if (isSubmittingRef.current) return;

      e.preventDefault();
      e.returnValue = 'Your quiz progress will be automatically submitted if you leave. Are you sure?';
      
      // Auto-submit quiz
      handleAutoSubmit();
      
      return e.returnValue;
    };

    // Function to handle popstate (back button)
    const handlePopState = (e) => {
      if (isSubmittingRef.current) return;

      const confirmLeave = window.confirm(
        'If you go back, your quiz will be automatically submitted. Do you want to continue?'
      );

      if (confirmLeave) {
        handleAutoSubmit();
      } else {
        // Push state back to stay on quiz page
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Push initial state to detect back button
    window.history.pushState(null, '', window.location.pathname);

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [quiz, startTime, answers]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getById(id);
      setQuiz(response.data.quiz);
    }catch (error) {
      if (error.response?.status === 403) {
        const { message, daysRemaining, canRetakeAt } = error.response.data;
        alert(`${message}\nYou can retake this quiz in ${daysRemaining} days.`);
        navigate('/quizzes');
      } else {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz');
      }}finally {
      setLoading(false);
    }
  };


  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting || isSubmittingRef.current) return;

    const unanswered = answers.filter((a) => a === null).length;
    if (unanswered > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered questions. Submit anyway?`
      );
      if (!confirm) return;
    }

    setSubmitting(true);
    isSubmittingRef.current = true;

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const response = await resultAPI.submit({
        quizId: id,
        answers: answers,
        timetaken: timeTaken,
        contestId: contestId || null,
      });

      if (response.data.result?.id) {
        navigate(`/result/${response.data.result.id}`, { replace: true });
      } else {
        navigate('/results', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // Auto-submit function for page unload scenarios
  const handleAutoSubmit = async () => {
    if (isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      
      // Use sendBeacon for reliable submission during page unload
      const data = JSON.stringify({
        quizId: id,
        answers: answers,
        timetaken: timeTaken,
        contestId: contestId || null,
      });

      const token = localStorage.getItem('token');
      const blob = new Blob([data], { type: 'application/json' });
      
      // Try to use sendBeacon first (more reliable during unload)
      const beaconSent = navigator.sendBeacon(
        `${import.meta.env.VITE_API_BASE_URL}/result/submit`,
        blob
      );

      if (!beaconSent) {
        // Fallback to sync XHR if beacon fails
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL}/result/submit`, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(data);
      }
    } catch (err) {
      console.error('Auto-submit failed:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;

  if (error || !quiz) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg shadow-sm">
        {error || 'Quiz not found'}
      </div>
    );
  }

  const question = quiz.questions?.[currentQuestion];
  if (!question) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        <p>Quiz questions not available</p>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 transition-colors duration-300">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {quiz.title}
            </h1>
            <div className="text-right">
              <div
                className={`text-lg font-semibold ${
                  timeLeft < 60 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Time Remaining</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  answers[currentQuestion] === index
                    ? 'border-primary-600 bg-primary-50 dark:bg-gray-600  '
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 '
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      answers[currentQuestion] === index
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {answers[currentQuestion] === index && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 ">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>

          <div className="hidden sm:flex space-x-2 overflow-x-auto scrollbar-hide  ">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                  index === currentQuestion
                    ? 'bg-primary-600 text-white'
                    : answers[index] !== null
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50 transition"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
