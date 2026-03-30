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
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showEligibilityError, setShowEligibilityError] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);
  
  // Anti-cheat states
  const [quizStarted, setQuizStarted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const didRun = useRef(false);
  const isSubmittingRef = useRef(false);
  const pendingNavigationRef = useRef(false);
  const warningsRef = useRef(0);
  const lastViolationTimeRef = useRef(0);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (quiz && quizStarted && !startTime) {
      setTimeLeft(quiz.timeLimit);
      setStartTime(Date.now());
      setAnswers(new Array(quiz.questions.length).fill(null));
    }
  }, [quiz, quizStarted, startTime]);

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
    if (!quiz || !startTime || !quizStarted) return;

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

      // Prevent navigation and show custom dialog
      window.history.pushState(null, '', window.location.pathname);
      setShowLeaveConfirm(true);
      pendingNavigationRef.current = true;
    };

    // Anti-cheat: Handle tab switching or window blur
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittingRef.current && quizStarted) {
        handleViolation("Tab switching or minimizing the window is not allowed.");
      }
    };

    // Anti-cheat: Handle clicking outside the window
    const handleBlur = () => {
      // Ignore blur if we are already submitting or the document still has focus
      if (!isSubmittingRef.current && quizStarted && !document.hasFocus()) {
        handleViolation("Clicking outside the quiz window or switching tabs is not allowed.");
      }
    };

    // Anti-cheat: Handle exiting fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmittingRef.current && quizStarted) {
        handleViolation("Exiting full screen is not allowed during the quiz.");
      }
    };

    // Push initial state to detect back button
    window.history.pushState(null, '', window.location.pathname);

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [quiz, startTime, answers, quizStarted]);

  const handleViolation = (message) => {
    // Debounce to prevent multiple immediate triggers (e.g., blur + visibilitychange right after each other)
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 2000) return;
    lastViolationTimeRef.current = now;

    const currentWarnings = warningsRef.current;
    
    // Auto-submit on 3rd warning (which means they already had 2)
    if (currentWarnings >= 2) {
      alert("You have exceeded the maximum number of warnings (3). Your quiz is being automatically submitted.");
      handleAutoSubmit().then(() => {
        // Fallback navigation if auto-submit doesn't redirect
        navigate('/results', { replace: true });
      });
      return;
    }
    
    // Increment warnings
    warningsRef.current = currentWarnings + 1;
    setWarnings(warningsRef.current);
    setWarningMessage(`${message} Warning ${warningsRef.current} of 3.`);
    setShowWarningModal(true);
  };
  
  const resumeFullscreenAndQuiz = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setShowWarningModal(false);
    } catch (err) {
      console.error("Error attempting to enable fullscreen:", err);
      // If we can't get fullscreen, they still need to close the modal
      setShowWarningModal(false);
    }
  };

  const startQuizFlow = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setQuizStarted(true);
    } catch (err) {
      alert("Failed to enter full screen. Full screen is required to take this quiz.");
      console.error("Error enabling full screen:", err);
    }
  };

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getById(id);
      setQuiz(response.data.quiz);
    }catch (error) {
      if (error.response?.status === 403) {
        const { message, daysRemaining, canRetakeAt } = error.response.data;
        setEligibilityData({ message, daysRemaining, canRetakeAt });
        setShowEligibilityError(true);
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

  // Handle confirm leave action
  const handleConfirmLeave = async () => {
    setShowLeaveConfirm(false);
    await handleAutoSubmit();
    // Navigate back after submission
    setTimeout(() => {
      navigate(-1);
    }, 100);
  };

  // Handle cancel leave action
  const handleCancelLeave = () => {
    setShowLeaveConfirm(false);
    pendingNavigationRef.current = false;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;

  // Show eligibility error dialog instead of generic error
  if (showEligibilityError && eligibilityData) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
              Quiz Not Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {eligibilityData.message}
            </p>

            {/* Eligibility Info */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 border border-red-200 dark:border-red-800">
              {(() => {
                const now = new Date();
                const retakeDate = new Date(eligibilityData.canRetakeAt);
                const diffMs = retakeDate - now;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                const days = eligibilityData.daysRemaining;

                return (
                  <>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Time Remaining:</span>
                      <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                        {days >= 1 
                          ? `${days} ${days === 1 ? 'day' : 'days'}`
                          : diffHours >= 1
                          ? `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`
                          : `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'}`
                        }
                      </span>
                    </div>
                    {eligibilityData.canRetakeAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Available After:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {new Date(eligibilityData.canRetakeAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You can only retake each quiz once every 7 days to ensure fair practice and learning.
                </p>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={() => {
                setShowEligibilityError(false);
                navigate('/quizzes');
              }}
              className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg shadow-primary-600/30"
            >
              Browse Other Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show custom error if quiz fetching failed
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

  // Pre-quiz screen requiring fullscreen
  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-12 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h4m-4 0H8m4-10a4 4 0 110 8 4 4 0 010-8zm-8 4h.01M20 11h.01M16 11h.01M8 11h.01" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Rules & Regulations
          </h2>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 mb-8 text-left border border-orange-200 dark:border-orange-800/50">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-400 mb-3 flex items-center gap-2">
               Strict Anti-Cheat constraints are applied!
            </h3>
            <ul className="space-y-3 text-orange-700 dark:text-orange-300">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                This quiz must be taken in Full Screen mode.
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Exiting Full Screen, switching tabs, minimizing, or split-screening will result in a warning.
              </li>
              <li className="flex items-start font-bold">
                <svg className="w-5 h-5 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto-Submit: After 3 warnings, the quiz will be submitted and ended automatically. No exceptions.
              </li>
            </ul>
          </div>
          <button
            onClick={startQuizFlow}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <span>I Understand, Start Quiz in Fullscreen</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
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

      {/* Custom Leave Confirmation Dialog */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
              Leave Quiz?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              If you go back, your quiz will be automatically submitted with your current answers. This action cannot be undone.
            </p>

            {/* Progress Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Answered Questions:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {answers.filter((a) => a !== null).length} / {quiz.questions.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Time Remaining:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelLeave}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Stay & Continue
              </button>
              <button
                onClick={handleConfirmLeave}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg shadow-orange-600/30"
              >
                Submit & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-900/40 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full border-t-4 border-red-500 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Violation Detected
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-8 font-medium">
              {warningMessage}
            </p>
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2 font-semibold">
                <span className="text-gray-600 dark:text-gray-400">Warnings</span>
                <span className="text-red-600 dark:text-red-400">{warnings} / 3</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${(warnings / 3) * 100}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={resumeFullscreenAndQuiz}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Quiz Eligibility Error Dialog */}
      {showEligibilityError && eligibilityData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
              Quiz Not Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {eligibilityData.message}
            </p>

            {/* Eligibility Info */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 border border-red-200 dark:border-red-800">
              {(() => {
                const now = new Date();
                const retakeDate = new Date(eligibilityData.canRetakeAt);
                const diffMs = retakeDate - now;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                const days = eligibilityData.daysRemaining;

                return (
                  <>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Time Remaining:</span>
                      <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                        {days >= 1 
                          ? `${days} ${days === 1 ? 'day' : 'days'}`
                          : diffHours >= 1
                          ? `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`
                          : `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'}`
                        }
                      </span>
                    </div>
                    {eligibilityData.canRetakeAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Available After:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {new Date(eligibilityData.canRetakeAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You can only retake each quiz once every 7 days to ensure fair practice and learning.
                </p>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={() => {
                setShowEligibilityError(false);
                navigate('/quizzes');
              }}
              className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg shadow-primary-600/30"
            >
              Browse Other Quizzes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
