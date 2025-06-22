import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import axios from "../axiosConfig.jsx";
import QuizCard from "../components/QuizCard";
import QuizPopup from "../components/QuizPopup";

const Home = () => {
  const { t } = useTranslation("home");
  const [ongoingQuizzes, setOngoingQuizzes] = useState([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [pastQuizzes, setPastQuizzes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [attemptedQuizIds, setAttemptedQuizIds] = useState([]);

  const currentUser = useSelector((state) => state.user.currentUser);
  const isLoggedIn = !!currentUser;

  useEffect(() => {
    fetchQuizzes();
    if (isLoggedIn) {
      fetchAttemptedQuizzes();
    }
    // eslint-disable-next-line
  }, [isLoggedIn]);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get("quiz/get-all");
      categorizeQuizzes(response.data.quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const fetchAttemptedQuizzes = async () => {
    try {
      const response = await axios.get("user/past-quizzes");
      if (response.data.success) {
        setAttemptedQuizIds(response.data.pastQuizzes.map(q => q.quizId || q.id));
      }
    } catch (error) {
      // Ignore error if not logged in
    }
  };

  const categorizeQuizzes = (quizzes) => {
    const now = new Date();
    const ongoing = [];
    const upcoming = [];
    const past = [];

    quizzes.forEach((quiz) => {
      const startDate = new Date(quiz.startDate);
      const endDate = new Date(quiz.endDate);
      if (now >= startDate && now <= endDate) {
        ongoing.push(quiz);
      } else if (now < startDate) {
        upcoming.push(quiz);
      } else {
        past.push(quiz);
      }
    });

    setOngoingQuizzes(ongoing);
    setUpcomingQuizzes(upcoming);
    setPastQuizzes(past);
  };

  const handleStartQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setShowPopup(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const floatingObjectVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-200 py-10 relative overflow-hidden"
    >
      {/* Floating objects */}
      <motion.div
        key="floating-yellow"
        className="absolute top-20 left-20 w-16 h-16 bg-yellow-300 rounded-full opacity-50"
        variants={floatingObjectVariants}
        animate="animate"
      />
      <motion.div
        key="floating-blue"
        className="absolute bottom-40 right-40 w-24 h-24 bg-blue-300 rounded-full opacity-50"
        variants={floatingObjectVariants}
        animate="animate"
      />
      <motion.div
        key="floating-green"
        className="absolute top-1/2 left-1/3 w-20 h-20 bg-green-300 rounded-full opacity-50"
        variants={floatingObjectVariants}
        animate="animate"
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold text-center mb-8 text-purple-600 animate-pulse"
        >
          {t("welcome")}
        </motion.h1>

        {/* Ongoing Quizzes Section */}
        {ongoingQuizzes.length > 0 ? (
          <motion.section variants={itemVariants} className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center text-orange-600 animate-bounce">
              🚀 {t("ongoingQuizzes")}
            </h2>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {ongoingQuizzes.map((quiz) => (
                <motion.div
                  key={quiz._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <QuizCard
                    quiz={quiz}
                    onStart={() => handleStartQuiz(quiz._id)}
                    isLoggedIn={isLoggedIn}
                    alreadyAttempted={false}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        ) : (
          <motion.p
            variants={itemVariants}
            className="text-center text-2xl font-extrabold text-gray-600 mb-12"
          >
            There are no quizzes ongoing currently, please visit later.
          </motion.p>
        )}

        {/* Upcoming Quizzes Section */}
        {upcomingQuizzes.length > 0 && (
          <motion.section variants={itemVariants} className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center text-green-600 animate-bounce">
              🔮 {t("upcomingQuizzes")}
            </h2>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {upcomingQuizzes.map((quiz) => (
                <motion.div
                  key={quiz._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <QuizCard quiz={quiz} isLoggedIn={isLoggedIn} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Past Quizzes Section */}
        {pastQuizzes.length > 0 && (
          <motion.section variants={itemVariants}>
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-600 animate-bounce">
              📚 {t("pastQuizzes")}
            </h2>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {pastQuizzes.map((quiz) => (
                <motion.div
                  key={quiz._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <QuizCard quiz={quiz} isLoggedIn={isLoggedIn} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}
      </div>

      <QuizPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        quizId={selectedQuizId}
        alreadyAttempted={attemptedQuizIds.includes(selectedQuizId)}
      />
    </motion.div>
  );
};

export default Home;
