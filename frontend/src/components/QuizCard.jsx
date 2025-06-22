import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaLanguage, FaQuestionCircle, FaTag } from "react-icons/fa";

const QuizCard = ({ quiz, isLoggedIn, onStart, alreadyAttempted }) => {
  const { t } = useTranslation("home");
  const currentDate = new Date();
  const startDate = new Date(quiz.startDate);
  const endDate = new Date(quiz.endDate);

  // Set time to start of day for comparison
  const resetTime = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const currentDateNoTime = resetTime(currentDate);
  const startDateNoTime = resetTime(startDate);
  const endDateNoTime = resetTime(endDate);

  // A quiz is ongoing if today is between start and end dates (inclusive)
  const isOngoing = currentDateNoTime >= startDateNoTime && currentDateNoTime <= endDateNoTime;
  // A quiz is upcoming if today is before the start date
  const isUpcoming = currentDateNoTime < startDateNoTime;

  const getDaysRemaining = (targetDate) => {
    const timeDiff = targetDate.getTime() - currentDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getBadgeContent = () => {
    if (isOngoing) {
      const daysLeft = getDaysRemaining(endDate);
      return daysLeft === 0 ? t("endsToday") : t("daysLeft", { count: daysLeft });
    } else if (isUpcoming) {
      const daysUntilStart = getDaysRemaining(startDate);
      return daysUntilStart === 0 ? t("startsToday") : t("startsIn", { count: daysUntilStart });
    } else {
      return t("closed");
    }
  };

  const getBadgeColor = () => {
    if (isOngoing) return "bg-green-500";
    if (isUpcoming) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-2xl overflow-hidden relative"
      whileHover={{
        y: -10,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div
        className={`absolute top-4 right-4 ${getBadgeColor()} text-white text-lg font-bold px-4 py-2 rounded-full z-10 shadow-lg`}
      >
        {getBadgeContent()}
      </div>
      <img
        src={quiz.imageLink}
        alt={quiz.title}
        className="w-full h-56 object-cover"
      />
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-3 text-purple-700">
          {quiz.title}
        </h3>
        <p className="text-gray-600 mb-4 text-lg">{quiz.description}</p>
        <div className="flex items-start mb-4">
          <FaTag className="mr-2  text-blue-500" size={20} />
          <span className="font-semibold  mr-2">{t("categories")}</span>
          <div className="flex flex-wrap gap-2">
            {(quiz.categories || []).map((category, index) => (
              <span
                key={index}
                className="bg-blue-100 text-black-800 text-sm font-semibold px-3 py-1 rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
        {/* Show available sub-quizzes if any */}
        {quiz.subQuizzes && quiz.subQuizzes.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-medium mb-2">
              Available Language Versions:
            </p>
            <div className="flex flex-wrap gap-2">
              {quiz.subQuizzes.map((subQuiz, index) => (
                <span
                  key={index}
                  className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full"
                >
                  {subQuiz.language}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {alreadyAttempted && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center font-semibold">
            {t('alreadyAttempted') || 'You have already attempted this quiz.'}
          </div>
        )}
        {isOngoing && (
          <motion.button
            onClick={() => onStart(quiz._id)}
            className={`mt-4 text-white text-xl font-bold px-6 py-3 rounded-full transition duration-300 ease-in-out w-full ${alreadyAttempted ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-purple-600 hover:bg-purple-700'}`}
            whileHover={alreadyAttempted ? {} : { scale: 1.05 }}
            whileTap={alreadyAttempted ? {} : { scale: 0.95 }}
            disabled={alreadyAttempted}
          >
            {alreadyAttempted ? t('alreadyAttempted') : (quiz.subQuizzes && quiz.subQuizzes.length > 0 
              ? "Start Quiz" 
              : t("startQuizNow")
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default QuizCard;
