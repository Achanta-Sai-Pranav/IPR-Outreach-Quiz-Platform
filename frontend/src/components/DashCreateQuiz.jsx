import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../axiosConfig.jsx";

const DashCreateQuiz = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    duration: 30,
    totalMarks: 20,
    passingMarks: 10,
    startDate: "",
    endDate: "",
    imageLink: "",
    categories: [],
    languages: [],
  });

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoriesByDifficulty, setCategoriesByDifficulty] = useState({});
  const [languageOptions, setLanguageOptions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategoriesAndLanguages = async () => {
      try {
        const [categoriesByDifficultyResponse, languagesResponse] = await Promise.all([
          axios.get("questions/categories-by-difficulty"),
          axios.get("questions/languages"),
        ]);
        setCategoriesByDifficulty(categoriesByDifficultyResponse.data.categoriesByDifficulty);
        // Flatten all categories for backward compatibility
        const allCategories = Object.values(categoriesByDifficultyResponse.data.categoriesByDifficulty).flat();
        setCategoryOptions(allCategories);
        setLanguageOptions(languagesResponse.data.languages);
      } catch (error) {
        console.error("Error fetching categories and languages:", error);
      }
    };

    fetchCategoriesAndLanguages();
  }, []);
  useEffect(() => {
    if (!currentUser.user || !currentUser.user.isAdmin) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewQuiz((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setNewQuiz((prev) => {
      const updatedCategories = checked
        ? [...prev.categories, value]
        : prev.categories.filter((cat) => cat !== value);

      setError("");
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    setNewQuiz((prev) => {
      const updatedLanguages = checked
        ? [...prev.languages, value]
        : prev.languages.filter((lang) => lang !== value);

      setError("");
      return { ...prev, languages: updatedLanguages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !newQuiz.title ||
      !newQuiz.description ||
      !newQuiz.duration ||
      !newQuiz.totalMarks ||
      !newQuiz.passingMarks ||
      !newQuiz.startDate ||
      !newQuiz.endDate ||
      newQuiz.categories.length === 0 ||
      newQuiz.languages.length === 0
    ) {
      toast.error(
        "Please fill all required fields, select at least one category, and choose at least one language"
      );
      return;
    }

    // Validate that passing marks don't exceed total marks
    if (newQuiz.passingMarks > newQuiz.totalMarks) {
      toast.error("Passing marks cannot exceed total marks");
      return;
    }

    // Validate dates
    const startDate = new Date(newQuiz.startDate);
    const endDate = new Date(newQuiz.endDate);
    const now = new Date();

    // Set time to start of day for start date and end of day for end date
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);

    if (startDate < now) {
      toast.error("Start date must be in the future");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    setLoading(true);
    try {
      const quizData = {
        ...newQuiz,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      const response = await axios.post("quiz/create", quizData);

      // Check if we have a quiz in the response, even if there was an error
      if (response.data.quiz) {
        toast.success("Quiz created successfully!");
        setNewQuiz({
          title: "",
          description: "",
          duration: 30,
          totalMarks: 20,
          passingMarks: 10,
          startDate: "",
          endDate: "",
          imageLink: "",
          categories: [],
          languages: [],
        });
        return; // Exit early since quiz was created successfully
      }

      // If we don't have a quiz, check the success flag
      if (response.data.success) {
        toast.success("Quiz created successfully!");
        setNewQuiz({
          title: "",
          description: "",
          duration: 30,
          totalMarks: 20,
          passingMarks: 10,
          startDate: "",
          endDate: "",
          imageLink: "",
          categories: [],
          languages: [],
        });
      } else {
        toast.error(response.data.message || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      const errorMessage = error.response?.data?.message || error.message || "An error occurred while creating the quiz";
      
      // If we have a quiz in the error response, the quiz was created successfully
      if (error.response?.data?.quiz) {
        toast.success("Quiz created successfully!");
        setNewQuiz({
          title: "",
          description: "",
          duration: 30,
          totalMarks: 20,
          passingMarks: 10,
          startDate: "",
          endDate: "",
          imageLink: "",
          categories: [],
          languages: [],
        });
      } else {
        toast.error(errorMessage);
        
        // If unauthorized, redirect to login
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate("/login");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-[calc(88vh)] items-center bg-white p-8 sm:p-8 md:p-8">
      <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-[98rem] w-full border-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 text-blue-600">
          Create New Quiz
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label
              className="block text-gray-700 text-base sm:text-lg font-bold mb-2"
              htmlFor="title"
            >
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Quiz Title"
              value={newQuiz.title}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-base sm:text-lg font-bold mb-2"
              htmlFor="description"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Quiz Description"
              value={newQuiz.description}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-gray-700 text-base sm:text-lg font-bold mb-2"
                htmlFor="duration"
              >
                Duration (minutes) *
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={newQuiz.duration}
                onChange={handleInputChange}
                required
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                className="block text-gray-700 text-base sm:text-lg font-bold mb-2"
                htmlFor="totalMarks"
              >
                Total Marks *
              </label>
              <input
                id="totalMarks"
                name="totalMarks"
                type="number"
                min="1"
                value={newQuiz.totalMarks}
                onChange={handleInputChange}
                required
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                className="block text-gray-700 text-base sm:text-lg font-bold mb-2"
                htmlFor="passingMarks"
              >
                Passing Marks *
              </label>
              <input
                id="passingMarks"
                name="passingMarks"
                type="number"
                min="1"
                value={newQuiz.passingMarks}
                onChange={handleInputChange}
                required
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-1/2">
              <label
                className="block text-gray-700 text-base sm:text-lg font-bold mb-2"
                htmlFor="startDate"
              >
                Start Date *
              </label>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={newQuiz.startDate}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                required
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full sm:w-1/2">
              <label
                className="block text-gray-700 text-base sm:text-lg font-bold mb-2"
                htmlFor="endDate"
              >
                End Date *
              </label>
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={newQuiz.endDate}
                onChange={handleInputChange}
                min={newQuiz.startDate || new Date().toISOString().slice(0, 16)}
                required
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-base sm:text-lg font-bold mb-2">
              Languages *
            </label>
            <div className="flex flex-wrap">
              {languageOptions.map((language) => (
                <label
                  key={language}
                  className="inline-flex items-center mr-4 mb-2"
                >
                  <input
                    type="checkbox"
                    name="languages"
                    value={language}
                    checked={newQuiz.languages.includes(language)}
                    onChange={handleLanguageChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700 text-sm sm:text-base">
                    {language}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-base sm:text-lg font-bold mb-2">
              Categories *
            </label>
            <div className="space-y-4">
              {Object.entries(categoriesByDifficulty).map(([difficulty, categories]) => {
                const getDifficultyColor = (diff) => {
                  switch (diff) {
                    case 'easy': return 'border-green-300 bg-green-50';
                    case 'medium': return 'border-yellow-300 bg-yellow-50';
                    case 'hard': return 'border-red-300 bg-red-50';
                    default: return 'border-gray-200 bg-gray-50';
                  }
                };
                
                const getDifficultyTextColor = (diff) => {
                  switch (diff) {
                    case 'easy': return 'text-green-800';
                    case 'medium': return 'text-yellow-800';
                    case 'hard': return 'text-red-800';
                    default: return 'text-gray-800';
                  }
                };

                return (
                  <div key={difficulty} className={`border rounded-lg p-4 ${getDifficultyColor(difficulty)}`}>
                    <h4 className={`text-lg font-semibold mb-3 capitalize ${getDifficultyTextColor(difficulty)}`}>
                      {difficulty} Level
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {categories.map((category) => (
                        <label
                          key={category}
                          className="inline-flex items-center"
                        >
                          <input
                            type="checkbox"
                            name="categories"
                            value={category}
                            checked={newQuiz.categories.includes(category)}
                            onChange={handleCategoryChange}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                          <span className="ml-2 text-gray-700 text-sm sm:text-base">
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-base sm:text-lg font-bold mb-2"
              htmlFor="imageLink"
            >
              Image Link
            </label>
            <input
              id="imageLink"
              name="imageLink"
              type="text"
              placeholder="Image URL"
              value={newQuiz.imageLink}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white text-lg font-bold transition-all hover:bg-blue-700 active:scale-[.98] disabled:opacity-50"
          >
            {loading ? "Creating Quiz..." : "Create Quiz"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashCreateQuiz;
