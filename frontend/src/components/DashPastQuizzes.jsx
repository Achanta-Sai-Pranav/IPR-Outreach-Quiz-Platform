import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCalendarAlt, FaClock, FaPercent } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "../axiosConfig.jsx";

const DashPastQuizzes = () => {
  const [pastQuizzes, setPastQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const { t } = useTranslation("dashboard");

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchPastQuizzes = async () => {
      try {
        console.log("Fetching past quizzes...");
        const response = await axios.get("user/past-quizzes", {
          withCredentials: true,
        });
        console.log("API Response:", response.data);
        if (response.data.success) {
          setPastQuizzes(response.data.pastQuizzes);
          console.log("Past quizzes set:", response.data.pastQuizzes);
        } else {
          console.error("API Error:", response.data.message);
          setError(response.data.message || "Failed to fetch past quizzes");
          toast.error(response.data.message || "Failed to fetch past quizzes");
        }
      } catch (error) {
        console.error("Error fetching past quizzes:", error);
        console.error("Error details:", error.response?.data);
        console.error("Error status:", error.response?.status);
        console.error("Error headers:", error.response?.headers);
        setError(error.response?.data?.message || "Failed to fetch past quizzes");
        toast.error(error.response?.data?.message || "Failed to fetch past quizzes");
      } finally {
        setLoading(false);
      }
    };

    fetchPastQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center min-h-[calc(88vh)] items-center bg-white p-8">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-[98rem] min-h-[80vh] w-full border-2">
          <div className="text-center text-lg sm:text-xl text-red-600 mt-6 sm:mt-10 p-4 sm:p-6 bg-red-50 rounded-lg shadow">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-[calc(88vh)] items-center bg-white p-8">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-[98rem] min-h-[80vh] w-full border-2">
        <h2 className="text-4xl font-semibold mb-8 text-blue-600">
          {t("pastQuizzes")}
        </h2>
        {pastQuizzes.length === 0 ? (
          <div className="text-center text-lg sm:text-xl text-gray-600 mt-6 sm:mt-10 p-4 sm:p-6 bg-gray-100 rounded-lg shadow">
            {t("noPastQuizzes")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {t("quizName")} {quiz.quizName}
                </h3>
                <div className="flex flex-wrap mb-3">
                  {quiz.categories.map((category, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center">
                    <FaPercent className="mr-2 text-purple-500" />
                    {t("result")} {quiz.percentage.toFixed(2)}%
                  </p>
                  <p className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-green-500" />
                    {t("submitted")}{" "}
                    {new Date(quiz.submittedAt).toLocaleDateString()}
                  </p>
                  <p className="flex items-center">
                    <FaClock className="mr-2 text-red-500" />
                    {t("timeTaken")} {formatTime(quiz.timeTaken)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashPastQuizzes;
