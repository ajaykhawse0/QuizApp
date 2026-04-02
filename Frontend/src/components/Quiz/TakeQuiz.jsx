import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { quizAPI, resultAPI, contestAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { AlertCircle, Clock, ShieldAlert, Maximize, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const contestId = searchParams.get('contestId');
  const [quiz, setQuiz] = useState(null);
  const [contest, setContest] = useState(null);
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
      if (contestId && contest?.endTime) {
        const now = Date.now();
        const end = new Date(contest.endTime).getTime();
        const remainingSeconds = Math.max(0, Math.floor((end - now) / 1000));
        setTimeLeft(remainingSeconds);
      } else {
        setTimeLeft(quiz.timeLimit);
      }
      setStartTime(Date.now());
      setAnswers(new Array(quiz.questions.length).fill(null));
    }
  }, [quiz, contest, quizStarted, startTime, contestId]);

  useEffect(() => {
    if (timeLeft > 0 && startTime) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit({ navigateToResult: true });
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

    const handleBeforeUnload = (e) => {
      if (isSubmittingRef.current) return;
      e.preventDefault();
      e.returnValue = 'Your quiz progress will be automatically submitted if you leave. Are you sure?';
      handleAutoSubmit({ useBeacon: true });
      return e.returnValue;
    };

    const handlePopState = (e) => {
      if (isSubmittingRef.current) return;
      window.history.pushState(null, '', window.location.pathname);
      setShowLeaveConfirm(true);
      pendingNavigationRef.current = true;
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittingRef.current && quizStarted) {
        handleViolation("Tab switching or minimizing the window is not allowed.");
      }
    };

    const handleBlur = () => {
      if (!isSubmittingRef.current && quizStarted && !document.hasFocus()) {
        handleViolation("Clicking outside the quiz window or switching tabs is not allowed.");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmittingRef.current && quizStarted) {
        handleViolation("Exiting full screen is not allowed during the quiz.");
      }
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [quiz, startTime, answers, quizStarted]);

  const handleViolation = (message) => {
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 2000) return;
    lastViolationTimeRef.current = now;

    const currentWarnings = warningsRef.current;
    
    if (currentWarnings >= 2) {
      alert("You have exceeded the maximum number of warnings (3). Your quiz is being automatically submitted.");
      handleAutoSubmit({ navigateToResult: true });
      return;
    }
    
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
      const [quizResponse, contestResponse] = await Promise.all([
        quizAPI.getById(id),
        contestId ? contestAPI.getById(contestId) : Promise.resolve(null)
      ]);
      setQuiz(quizResponse.data.quiz);
      if (contestResponse) {
        setContest(contestResponse.data.contest);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        const { message, daysRemaining, canRetakeAt } = error.response.data;
        setEligibilityData({ message, daysRemaining, canRetakeAt });
        setShowEligibilityError(true);
      } else {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz');
      }
    } finally {
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
      const confirm = window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`);
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

  const handleAutoSubmit = async ({ useBeacon = false, navigateToResult = false } = {}) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const payload = {
        quizId: id,
        answers: answers,
        timetaken: timeTaken,
        contestId: contestId || null,
      };

      if (!useBeacon) {
        const response = await resultAPI.submit(payload);
        if (navigateToResult) {
          if (response?.data?.result?.id) {
            navigate(`/result/${response.data.result.id}`, { replace: true });
          } else {
            navigate('/results', { replace: true });
          }
        }
        return;
      }

      const data = JSON.stringify(payload);

      const token = localStorage.getItem('token');
      const blob = new Blob([data], { type: 'application/json' });
      
      const beaconSent = navigator.sendBeacon(`${import.meta.env.VITE_API_BASE_URL}/result/submit`, blob);

      if (!beaconSent) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL}/result/submit`, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(data);
      }
    } catch (err) {
      console.error('Auto-submit failed:', err);
      isSubmittingRef.current = false;
    }
  };

  const handleConfirmLeave = async () => {
    setShowLeaveConfirm(false);
    await handleAutoSubmit({ navigateToResult: true });
  };

  const handleCancelLeave = () => {
    setShowLeaveConfirm(false);
    pendingNavigationRef.current = false;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

  if (showEligibilityError && eligibilityData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[80vh]">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft-xl max-w-md w-full p-8 text-center border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz Not Available Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{eligibilityData.message}</p>
          <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-5 mb-8 text-left border border-orange-100 dark:border-orange-800/30">
            {(() => {
              const now = new Date();
              const retakeDate = new Date(eligibilityData.canRetakeAt);
              const diffMs = retakeDate - now;
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffMinutes = Math.floor(diffMs / (1000 * 60));
              const days = eligibilityData.daysRemaining;

              return (
                <div className="space-y-3 font-medium">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Time Remaining</span>
                    <span className="text-orange-600 dark:text-orange-400 text-lg">
                      {days >= 1 ? `${days} ${days === 1 ? 'day' : 'days'}` : diffHours >= 1 ? `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'}` : `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'}`}
                    </span>
                  </div>
                  {eligibilityData.canRetakeAt && (
                    <div className="flex justify-between items-center text-sm pt-3 border-t border-orange-200/50 dark:border-orange-800/50">
                      <span className="text-gray-600 dark:text-gray-400">Available On</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(eligibilityData.canRetakeAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          <button
            onClick={() => { setShowEligibilityError(false); navigate('/quizzes'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-primary-600 text-gray-900 hover:text-white dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-primary-600 rounded-xl font-semibold transition-all duration-300 shadow-sm"
          >
            Browse Other Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error || 'Quiz not found'}</p>
        </div>
      </div>
    );
  }

  const question = quiz.questions?.[currentQuestion];
  if (!question) return null;

  if (!quizStarted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[80vh]">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 w-full animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4 tracking-tight">Rules & Regulations</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            This quiz is strictly monitored. Please read the following rules carefully before starting.
          </p>

          <div className="space-y-4 mb-10 text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex gap-4">
              <Maximize className="w-6 h-6 text-primary-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Full Screen Required</p>
                <p className="text-sm mt-1">You must remain in full screen for the entire duration of the quiz.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">No Tab Switching</p>
                <p className="text-sm mt-1">Switching tabs, minimizing the window, or exiting full screen will result in a warning.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-600 dark:text-red-400">Auto-Submit</p>
                <p className="text-sm mt-1">After 3 warnings, your quiz will be automatically submitted.</p>
              </div>
            </div>
          </div>

          <button
            onClick={startQuizFlow}
            className="w-full flex justify-center items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-sm"
          >
            I Understand, Start Quiz
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-[85vh] flex flex-col">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft-xl border border-gray-100 dark:border-gray-800 flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Ribbon */}
        <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold font-mono text-xl shadow-inner ${timeLeft < 60 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'}`}>
              <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Area */}
        <div className="p-6 md:p-8 flex-1 flex flex-col">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8 leading-relaxed">
            {question.question}
          </h2>

          <div className="space-y-4 flex-1">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`relative flex items-center p-5 cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                  answers[currentQuestion] === index
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    className="sr-only"
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswerSelect(index)}
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      answers[currentQuestion] === index
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300 dark:border-gray-600 text-transparent'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white transition-opacity" style={{ opacity: answers[currentQuestion] === index ? 1 : 0 }} />
                  </div>
                </div>
                <div className="ml-4 text-gray-800 dark:text-gray-200 font-medium text-base">
                  {option}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 md:p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center justify-center w-full sm:w-auto gap-2 overflow-x-auto px-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`flex-shrink-0 w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                  index === currentQuestion
                    ? 'bg-primary-600 text-white shadow-md'
                    : answers[index] !== null
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-white border border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
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
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-all shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
              <CheckCircle2 className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-semibold transition-all shadow-sm"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Leave Confirmation Dialog */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft-xl max-w-md w-full p-8 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-6 text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">Leave Quiz?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              If you go back, your quiz will be automatically submitted with your current answers. This action cannot be undone.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 mb-8 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-500 dark:text-gray-400">Answers Saved</span>
                <span className="font-semibold text-gray-900 dark:text-white">{answers.filter((a) => a !== null).length} / {quiz.questions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Time Remaining</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCancelLeave}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Stay & Continue
              </button>
              <button
                onClick={handleConfirmLeave}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
              >
                Submit & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-red-900/50 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full border-t-4 border-red-500 animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Notice</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-8 font-medium">{warningMessage}</p>
            
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div className="flex justify-between text-sm mb-2 font-bold uppercase tracking-wider">
                <span className="text-gray-500 dark:text-gray-400">Warnings</span>
                <span className="text-red-600 dark:text-red-400">{warnings} / 3</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-red-500 h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${(warnings / 3) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={resumeFullscreenAndQuiz}
              className="w-full px-6 py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Maximize className="w-5 h-5" />
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
