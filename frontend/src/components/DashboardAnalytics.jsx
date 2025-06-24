import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { FaFileExcel } from "react-icons/fa";
import axios from "../axiosConfig.jsx";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardAnalytics = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("quiz/get-all");
      setQuizzes(response.data.quizzes);
      if (response.data.quizzes.length > 0) {
        const mostRecentQuiz = response.data.quizzes.reduce((a, b) =>
          new Date(a.createdAt) > new Date(b.createdAt) ? a : b
        );
        setSelectedQuiz(mostRecentQuiz._id);
        handleQuizSelect(mostRecentQuiz._id);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError("Failed to fetch quizzes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = async (quizId) => {
    if (!quizId) return;
    
    setSelectedQuiz(quizId);
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`analytics/dashboard/${quizId}`);
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError(error.response?.data?.message || "Failed to fetch analytics data");
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedQuiz) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `analytics/export/${selectedQuiz}`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `quiz_results_${selectedQuiz}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setError("Failed to export quiz data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("user/get-all-users", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users_data.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting users data:", error);
      setError("Failed to export users data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 20,
          boxHeight: 15,
          color: "#000",
          font: { size: 12, family: "Arial" },
        },
      },
    },
    layout: {
      padding: { top: 10, bottom: 10 },
    },
    scales: {
      x: {
        grid: { color: "#ccc" },
        ticks: { color: "#000" },
      },
      y: {
        grid: { color: "#ccc" },
        ticks: { color: "#000" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="flex justify-center min-h-[calc(88vh)] items-center bg-white p-0 sm:p-4 md:p-8 sm:mt-0 mt-10">
      <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-[98rem] min-h-[80vh] w-full border-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 sm:mb-6 text-blue-600">
          Quiz Analytics Dashboard
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row flex-wrap items-center gap-4">
          <div className="relative flex-grow w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out text-lg"
            />
          </div>

          <select
            value={selectedQuiz || ""}
            onChange={(e) => handleQuizSelect(e.target.value)}
            disabled={loading}
            className="w-full sm:w-auto p-4 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out appearance-none bg-white flex-grow disabled:opacity-50 text-lg"
          >
            <option value="">Select a quiz</option>
            {quizzes
              .filter((quiz) =>
                quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((quiz) => (
                <option key={quiz._id} value={quiz._id}>
                  {quiz.title}
                </option>
              ))}
          </select>
          <button
            onClick={handleExportExcel}
            className="flex items-center bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded min-w-[180px] min-h-[48px] text-lg"
            disabled={loading}
          >
            <FaFileExcel className="mr-2" /> Export Quiz Data
          </button>
          <button
            onClick={handleExportUsers}
            className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded min-w-[180px] min-h-[48px] text-lg"
            disabled={loading}
          >
            <FaFileExcel className="mr-2" /> Export Users
          </button>
        </div>

        {loading && (
          <div className="text-center text-lg sm:text-xl text-gray-600 mt-6 sm:mt-10 p-4 sm:p-6 bg-gray-100 rounded-lg shadow">
            Loading...
          </div>
        )}

        {!loading && quizzes.length === 0 && (
          <div className="text-center text-lg sm:text-xl text-gray-600 mt-6 sm:mt-10 p-4 sm:p-6 bg-gray-100 rounded-lg shadow">
            No quizzes available. Please create a new quiz.
          </div>
        )}

        {!loading && analyticsData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 sm:mb-6">
              {[
                {
                  title: "Total Participants",
                  value: analyticsData.totalParticipants,
                },
                {
                  title: "Completion Ratio",
                  value: (analyticsData.completionRatio * 100).toFixed(2) + "%",
                },
                {
                  title: "Average Score",
                  value: analyticsData.averageScore.toFixed(2) + "%",
                },
              ].map((card, index) => (
                <div
                  key={index}
                  className="bg-white bg-opacity-70 backdrop-blur-lg p-3 rounded-lg text-black shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:bg-opacity-80 transform hover:scale-105"
                >
                  <h3 className="text-base sm:text-lg font-semibold mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xl sm:text-2xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="h-64 sm:h-80 p-3 sm:p-5 bg-white bg-opacity-70 backdrop-blur-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:bg-opacity-80 transform hover:scale-105 min-w-[320px]">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-black">
                    Participation by Standard
                  </h3>
                  <Bar
                    data={{
                      labels: analyticsData ? Object.keys(analyticsData.participationByStd) : [],
                      datasets: [
                        {
                          label: "Participants",
                          data: analyticsData ? Object.values(analyticsData.participationByStd) : [],
                          backgroundColor: "#ff7043",
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
                <div className="h-64 sm:h-80 p-3 sm:p-5 bg-white bg-opacity-70 backdrop-blur-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:bg-opacity-80 transform hover:scale-105 min-w-[320px]">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-black">
                    Participation by City
                  </h3>
                  <Doughnut
                    data={{
                      labels: analyticsData ? Object.keys(analyticsData.participationByCity) : [],
                      datasets: [
                        {
                          data: analyticsData ? Object.values(analyticsData.participationByCity) : [],
                          backgroundColor: [
                            "#ff7043",
                            "#26a69a",
                            "#42a5f5",
                            "#ab47bc",
                            "#7e57c2",
                            "#5c6bc0",
                            "#ef5350",
                            "#66bb6a",
                            "#ffa726",
                            "#29b6f6",
                          ],
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-70 backdrop-blur-lg p-3 sm:p-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:bg-opacity-80">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-black">
                Top 5 Performing Students
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3">
                        Name
                      </th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3">
                        City
                      </th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3">
                        Standard
                      </th>
                      <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3">
                        Time Taken
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topPerformers.map((performer, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-2 sm:px-6 py-2 sm:py-4 font-medium text-gray-900 whitespace-nowrap">
                          {performer.name}
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4">
                          {performer.city}
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4">
                          {performer.std}
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4">
                          {performer.timeTaken}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardAnalytics;
