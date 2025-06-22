import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../axiosConfig.jsx";
import AdminQuizCard from "./AdminQuizCard";
import UpdateQuizPopup from "./UpdateQuizPopup";

const DashManageQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get("quiz/get-all");
      setQuizzes(response.data.quizzes);
      setFilteredQuizzes(response.data.quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to fetch quizzes");
    }
  };
  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const filtered = quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filter === "all" || getQuizStatus(quiz) === filter)
    );
    setFilteredQuizzes(filtered);
  }, [searchTerm, filter, quizzes]);

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
    const endDate = quiz.endDate ? new Date(quiz.endDate) : null;

    if (!startDate || !endDate) return "unknown";
    if (now < startDate) return "upcoming";
    if (now > endDate) return "past";
    return "ongoing";
  };

  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setShowUpdatePopup(true);
  };

  const handleUpdateQuiz = async (updatedQuiz) => {
    try {
      if (!updatedQuiz._id) {
        toast.error("Invalid quiz ID");
        return;
      }
      await axios.post(`quiz/update/${updatedQuiz._id}`, updatedQuiz);
      toast.success("Quiz updated successfully");
      setShowUpdatePopup(false);
      fetchQuizzes();
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast.error(error.response?.data?.message || "Failed to update quiz");
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    setQuizToDelete(quizId);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.post(`quiz/delete/${quizToDelete}`);
      toast.success("Quiz deleted successfully");
      setShowDeleteConfirmation(false);
      setQuizToDelete(null);
      setShowUpdatePopup(false); // Close the update popup
      setSelectedQuiz(null); // Clear the selected quiz
      fetchQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  return (
    <div className="flex justify-center min-h-[calc(88vh)] items-center bg-white p-8">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-[98rem] min-h-[80vh] w-full border-2">
        <h1 className="text-4xl font-bold mb-6 text-blue-600">Manage Quiz</h1>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Search quizzes..."
            className="p-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border rounded-md w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Quizzes</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="past">Past</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <AdminQuizCard
              key={quiz._id}
              quiz={quiz}
              onEdit={() => handleEditQuiz(quiz)}
            />
          ))}
        </div>

        {showUpdatePopup && (
          <UpdateQuizPopup
            quiz={selectedQuiz}
            onClose={() => setShowUpdatePopup(false)}
            onUpdate={handleUpdateQuiz}
            onDelete={handleDeleteQuiz}
          />
        )}

        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
              <p className="mb-6">
                Are you sure you want to delete this quiz? This action cannot be
                undone and all quiz data will be permanently deleted.{" "}
                <span className="font-bold">
                  Download all the data before deleting the quiz.
                </span>
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashManageQuiz;
