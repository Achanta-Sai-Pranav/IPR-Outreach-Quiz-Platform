import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../axiosConfig.jsx";

const Results = () => {
  const { t } = useTranslation("resultsQuiz");
  const navigate = useNavigate();
  const [results, setResults] = useState(() => {
    const savedResults = localStorage.getItem("quizResults");
    return savedResults ? JSON.parse(savedResults) : null;
  });

  const [submittedAnswers, setSubmittedAnswers] = useState(() => {
    const savedAnswers = localStorage.getItem("submittedAnswers");
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  });

  const [questions, setQuestions] = useState(() => {
    const savedQuestions = localStorage.getItem("questions");
    return savedQuestions ? JSON.parse(savedQuestions) : [];
  });

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const user = useSelector((state) => state.user);
  const userEmail = user?.currentUser?.user?.email;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!results || !questions.length) {
      navigate("/");
      return;
    }

    // Clean up localStorage after retrieving data
    localStorage.removeItem("quizResults");
    localStorage.removeItem("submittedAnswers");
    localStorage.removeItem("questions");

    const end = Date.now() + 3 * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  }, [results, questions, navigate]);

  window.history.pushState(null, null, window.location.pathname);
  window.addEventListener("popstate", () => {
    window.history.pushState(null, null, window.location.pathname);
  });

  const sendCertificateEmail = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("quiz/generate-certificate", {
        studentName: results.userName,
        quizName: results.quizName,
        percentage: results.scorePercentage,
        email: userEmail,
      });
      if (response.data.message) {
        setIsEmailSent(true);
        toast.success("Certificate sent successfully!");
      }
    } catch (error) {
      toast.error("Failed to send certificate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCertificate = async () => {
    setIsDownloading(true);
    try {
      const response = await axios.post("quiz/download-certificate", {
        studentName: results.userName,
        quizName: results.quizName,
        percentage: results.scorePercentage,
      }, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${results.quizName}_${results.userName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download certificate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!results || !questions.length) {
    return null;
  }

  const {
    score,
    totalMarks,
    passingMarks,
    correctAnswers,
    incorrectAnswers,
    skippedQuestions,
    isPassed,
    timeTaken,
    correctAnswersList = {},
    userName,
    quizName,
    scorePercentage
  } = results;

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionId) => {
    const submittedAnswer = submittedAnswers[questionId];
    const correctAnswer = correctAnswersList[questionId];
    
    if (!submittedAnswer) return "skipped";
    return submittedAnswer === correctAnswer ? "correct" : "incorrect";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "correct":
        return "text-green-500";
      case "incorrect":
        return "text-red-500";
      case "skipped":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const tableData = [
    { label: t("userName"), value: userName },
    { label: t("quizName"), value: quizName },
    { label: t("skippedQuestions"), value: skippedQuestions },
    { label: t("incorrectAnswers"), value: incorrectAnswers },
    { label: t("correctAnswers"), value: correctAnswers },
    { label: t("scorePercentage"), value: `${scorePercentage}%` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 relative"
    >
      <h1 className="text-3xl font-bold mb-8 text-center">
        {quizName || "Quiz Results"}
      </h1>

      <motion.table
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full mb-0 bg-white shadow-md rounded-lg overflow-hidden"
      >
        <tbody>
          {tableData.map(({ label, value }) => (
            <tr key={label} className="border-b">
              <td className="py-2 px-4 font-semibold">{label}</td>
              <td className="py-2 px-4">{value}</td>
            </tr>
          ))}
        </tbody>
      </motion.table>
      <div className="flex flex-col items-start gap-2">
        {!isEmailSent && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-blue-600 font-medium ml-4 mt-4"
          >
            {t("Click below to receive your certificate via email!")}
          </motion.p>
        )}

        <div className="flex flex-wrap gap-4 mt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${
              isEmailSent
                ? "bg-green-500 hover:bg-green-700"
                : "bg-blue-500 hover:bg-blue-700"
            } text-white font-bold py-2 px-4 rounded`}
            onClick={sendCertificateEmail}
            disabled={isEmailSent || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("sendCertificate")}
              </span>
            ) : isEmailSent ? (
              t("certificateSent")
            ) : (
              t("sendCertificate")
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            onClick={downloadCertificate}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("downloadCertificate")}
              </span>
            ) : (
              t("downloadCertificate")
            )}
          </motion.button>
        </div>

        {isEmailSent && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-600 font-medium ml-4"
          >
            {t("Check your email and download your certificate!")}
          </motion.p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8 bg-green-500 mb-8 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => navigate("/", { replace: true })}
      >
        {t("goHome")}
      </motion.button>

      <h2 className="text-2xl font-bold mb-4">{t("detailedResults")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Score Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Score:</span>
              <span className="font-medium">{score} / {totalMarks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Percentage:</span>
              <span className="font-medium">{scorePercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Passing Marks:</span>
              <span className="font-medium">{passingMarks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${isPassed ? "text-green-500" : "text-red-500"}`}>
                {isPassed ? "Passed" : "Failed"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Answer Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Correct Answers:</span>
              <span className="text-green-500 font-medium">{correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Incorrect Answers:</span>
              <span className="text-red-500 font-medium">{incorrectAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Skipped Questions:</span>
              <span className="text-yellow-500 font-medium">{skippedQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Taken:</span>
              <span className="font-medium">{formatTime(timeTaken)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Question Review</h2>
        {questions.map((question, index) => {
          const status = getQuestionStatus(question._id);
          return (
            <div key={question._id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Question {index + 1}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{question.question}</p>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = submittedAnswers[question._id] === option;
                  const isCorrect = correctAnswersList[question._id] === option;
                  let optionStyle = "bg-white";
                  if (isSelected && isCorrect) {
                    optionStyle = "bg-green-100 border-green-500";
                  } else if (isSelected && !isCorrect) {
                    optionStyle = "bg-red-100 border-red-500";
                  } else if (isCorrect) {
                    optionStyle = "bg-green-100 border-green-500";
                  }
                  return (
                    <div
                      key={optionIndex}
                      className={`p-3 rounded-lg border ${optionStyle}`}
                    >
                      {option}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </motion.div>
  );
};

export default Results;
