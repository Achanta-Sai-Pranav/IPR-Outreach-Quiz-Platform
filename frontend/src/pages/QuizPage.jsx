import { motion } from "framer-motion";
import { useCallback, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../axiosConfig.jsx";

const QuizPage = () => {
  const { t } = useTranslation("resultsQuiz");
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [answers, setAnswers] = useState({});
  const { currentUser } = useSelector((state) => state.user);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const submittedRef = useRef(false);

  const optionLabels = ["A", "B", "C", "D"];

  useEffect(() => {
    const nav = document.querySelector("nav");
    if (nav) {
      nav.style.display = "none";
    }
    fetchQuizQuestions();
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (nav) {
        nav.style.display = "block";
      }
    };
  }, []);

  useEffect(() => {
    if (timeRemaining === null) return;
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  useEffect(() => {
    // Check if already attempted before fetching questions
    const checkAlreadyAttempted = async () => {
      try {
        const res = await axios.get("user/past-quizzes");
        if (res.data.success) {
          const attempted = res.data.pastQuizzes.some(q => (q.quizId || q.id) === id);
          setAlreadyAttempted(attempted);
        }
      } catch (e) {
        // ignore
      } finally {
        setIsValidating(false);
      }
    };
    checkAlreadyAttempted();
  }, [id]);

  useEffect(() => {
    if (!isValidating && !alreadyAttempted) {
      fetchQuizQuestions();
    }
    // eslint-disable-next-line
  }, [isValidating, alreadyAttempted]);

  // Prevent refresh/leave/close
  useEffect(() => {
    if (alreadyAttempted || isValidating) return;
    const handleBeforeUnload = (e) => {
      if (!submittedRef.current) {
        e.preventDefault();
        e.returnValue = '';
        submitQuiz();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !submittedRef.current) {
        submitQuiz();
      }
    };
    const handlePageHide = () => {
      if (!submittedRef.current) {
        submitQuiz();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [alreadyAttempted, isValidating, timeRemaining]);

  useEffect(() => {
    if (alreadyAttempted) {
      const timer = setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [alreadyAttempted, navigate]);

  const fetchQuizQuestions = async () => {
    try {
      const response = await axios.get(`quiz/get-quiz-questions/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        const quizQuestions = response.data.quiz.questions || [];
        setQuiz(response.data.quiz);
        if (response.data.quiz && response.data.quiz.duration) {
          setTimeRemaining(response.data.quiz.duration * 60);
        } else {
          setTimeRemaining(15 * 60); // fallback
        }
        if (quizQuestions.length === 0) {
          toast.error("No questions found for this quiz");
          navigate("/");
          return;
        }
        setQuestions(quizQuestions);
      } else {
        toast.error(response.data.message || "Failed to fetch quiz questions");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      
      // Handle main quiz case
      if (error.response?.data?.isMainQuiz) {
        toast.error("Please select a language version from the quiz card to start the quiz");
        navigate("/");
        return;
      }
      
      toast.error(error.response?.data?.message || "An error occurred while fetching quiz questions");
      navigate("/");
    }
  };

  const handlePopState = (event) => {
    event.preventDefault();
    const confirmExit = window.confirm(
      "If you go back, the quiz will be submitted automatically. Are you sure?"
    );
    if (confirmExit) {
      submitQuiz();
    } else {
      window.history.pushState(null, null, window.location.pathname);
    }
  };

  const handleAnswerChange = useCallback((questionId, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  }, []);

  const submitQuiz = async () => {
    if (isSubmitting || submittedRef.current) return;
    setIsSubmitting(true);
    submittedRef.current = true;
    const totalDuration = quiz && quiz.duration ? quiz.duration * 60 : 15 * 60;
    const timeTaken = totalDuration - timeRemaining;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    const quizData = {
      quizId: id,
      answers,
      startTime: new Date(Date.now() - (timeTaken * 1000)).toISOString(),
      endTime: new Date().toISOString()
    };

    try {
      const response = await axios.post("quiz/submit", quizData, {
        withCredentials: true,
      });
      if (response.data.success) {
        localStorage.setItem("quizResults", JSON.stringify(response.data.result));
        localStorage.setItem("submittedAnswers", JSON.stringify(answers));
        localStorage.setItem("questions", JSON.stringify(questions));
        navigate(`/result/${id}`, { replace: true });
      } else {
        toast.error(response.data.message || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error(error.response?.data?.message || "An error occurred while submitting the quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormattedTime = useCallback(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, [timeRemaining]);

  if (isValidating) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Validating quiz access...</div>;
  }
  if (alreadyAttempted) {
    return <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-red-600">You have already attempted this quiz.</div>;
  }

  return (
    <>
      <motion.div
        className="fixed top-4 right-4 bg-white p-5 rounded-lg shadow-lg z-[99999]"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-xl font-semibold text-orange-600">
          {t("timeLeft")}
        </span>
        <div className="text-2xl font-bold text-red-600">
          {timeRemaining !== null ? getFormattedTime() : '--:--'}
        </div>
      </motion.div>

      <motion.div
        className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 p-4 sm:p-8 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h1 className="text-4xl font-bold text-center text-purple-700 mb-12 animate-pulse">
          {t("quizTime")}
        </h1>

        {questions && questions.length > 0 ? (
          <div className="space-y-8 max-w-4xl mx-auto">
            {questions.map((question, index) => (
              <motion.div
                key={question._id || question.id}
                className="bg-white p-8 rounded-xl shadow-xl border border-purple-200 relative overflow-hidden"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="absolute top-0 left-0 bg-gradient-to-r from-orange-500 to-yellow-500 w-2 h-full"></div>
                <h2 className="text-2xl font-bold text-purple-800 mb-4 relative z-10">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-lg font-semibold mr-2">
                    {index + 1}
                  </span>
                  {question.question}
                </h2>
                {question.imageLink && (
                  <img
                    src={question.imageLink}
                    alt="Question"
                    className="w-full h-[30rem] object-cover rounded-lg shadow-md mb-4"
                  />
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {question.options && question.options.map((option, optionIndex) => (
                    <motion.button
                      key={`${question._id}-${optionIndex}`}
                      className={`flex items-center p-4 border-2 border-purple-300 rounded-lg transition-all duration-300 ease-in-out ${
                        answers[question._id] === option
                          ? "bg-purple-100 border-purple-500"
                          : "bg-white hover:bg-purple-50"
                      }`}
                      onClick={() => handleAnswerChange(question._id, option)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="font-bold text-lg text-orange-600 mr-3">
                        {optionLabels[optionIndex]}
                      </span>
                      {option}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xl text-gray-600">
            Loading questions...
          </div>
        )}

        {questions && questions.length > 0 && (
          <div className="mt-8 sm:mt-12 text-center">
            <motion.button
              onClick={submitQuiz}
              className="px-8 py-4 bg-orange-500 text-white text-xl font-bold rounded-full hover:bg-orange-600 transition duration-300 ease-in-out shadow-lg disabled:opacity-60"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : t("submit")}
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default QuizPage;
