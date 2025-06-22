import { useState, useEffect, useRef } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "../axiosConfig.jsx";

const UpdateQuizPopup = ({ quiz, onClose, onUpdate, onDelete }) => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoriesByDifficulty, setCategoriesByDifficulty] = useState({});
  const [languageOptions, setLanguageOptions] = useState([]);

  const [updatedQuiz, setUpdatedQuiz] = useState({
    _id: quiz._id,
    title: quiz.title,
    description: quiz.description,
    duration: quiz.duration || 30,
    totalMarks: quiz.totalMarks || 20,
    passingMarks: quiz.passingMarks || 10,
    startDate: quiz.startDate ? new Date(quiz.startDate).toISOString().slice(0, 16) : "",
    endDate: quiz.endDate ? new Date(quiz.endDate).toISOString().slice(0, 16) : "",
    imageLink: quiz.imageLink || "",
    categories: quiz.categories || [],
    languages: quiz.languages || [],
  });

  const popupRef = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoriesByDifficultyRes, languagesRes] = await Promise.all([
          axios.get("questions/categories-by-difficulty"),
          axios.get("questions/languages"),
        ]);
        setCategoriesByDifficulty(categoriesByDifficultyRes.data.categoriesByDifficulty);
        // Flatten all categories for backward compatibility
        const allCategories = Object.values(categoriesByDifficultyRes.data.categoriesByDifficulty).flat();
        setCategoryOptions(allCategories);
        setLanguageOptions(languagesRes.data.languages);
      } catch (error) {
        console.error("Error fetching options:", error);
        toast.error("Failed to fetch categories and languages");
      }
    };
    fetchOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdatedQuiz((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setUpdatedQuiz((prev) => {
      const categories = checked
        ? [...prev.categories, value]
        : prev.categories.filter((cat) => cat !== value);
      return { ...prev, categories };
    });
  };

  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    setUpdatedQuiz((prev) => {
      const languages = checked
        ? [...prev.languages, value]
        : prev.languages.filter((lang) => lang !== value);
      return { ...prev, languages };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !updatedQuiz.title ||
      !updatedQuiz.description ||
      !updatedQuiz.duration ||
      !updatedQuiz.totalMarks ||
      !updatedQuiz.passingMarks ||
      !updatedQuiz.startDate ||
      !updatedQuiz.endDate ||
      updatedQuiz.categories.length === 0 ||
      updatedQuiz.languages.length === 0
    ) {
      toast.error("Please fill all required fields and select at least one category and language");
      return;
    }

    // Validate that passing marks don't exceed total marks
    if (updatedQuiz.passingMarks > updatedQuiz.totalMarks) {
      toast.error("Passing marks cannot exceed total marks");
      return;
    }

    if (new Date(updatedQuiz.endDate) <= new Date(updatedQuiz.startDate)) {
      toast.error("End time must be after start time");
      return;
    }

    onUpdate(updatedQuiz);
  };

  return (
    <div className="fixed left-0 right-0 top-[5.5rem] bottom-0 bg-black bg-opacity-50 flex justify-center items-start z-50" style={{height: 'calc(100vh - 5.5rem)'}}>
      <div ref={popupRef} className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Update Quiz</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="title"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={updatedQuiz.title}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={updatedQuiz.description}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="duration"
              >
                Duration (minutes) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="1"
                value={updatedQuiz.duration}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="totalMarks"
              >
                Total Marks *
              </label>
              <input
                type="number"
                id="totalMarks"
                name="totalMarks"
                min="1"
                value={updatedQuiz.totalMarks}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="passingMarks"
              >
                Passing Marks *
              </label>
              <input
                type="number"
                id="passingMarks"
                name="passingMarks"
                min="1"
                value={updatedQuiz.passingMarks}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="startDate"
              >
                Start Date and Time *
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={updatedQuiz.startDate}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="endDate"
              >
                End Date and Time *
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={updatedQuiz.endDate}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="imageLink"
            >
              Image Link
            </label>
            <input
              type="text"
              id="imageLink"
              name="imageLink"
              value={updatedQuiz.imageLink}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
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
                  <div key={difficulty} className={`border rounded-lg p-3 ${getDifficultyColor(difficulty)}`}>
                    <h4 className={`text-base font-semibold mb-2 capitalize ${getDifficultyTextColor(difficulty)}`}>
                      {difficulty} Level
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <label
                          key={category}
                          className="inline-flex items-center"
                        >
                          <input
                            type="checkbox"
                            name="categories"
                            value={category}
                            checked={updatedQuiz.categories.includes(category)}
                            onChange={handleCategoryChange}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                          <span className="ml-2 text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Languages *
            </label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((language) => (
                <label
                  key={language}
                  className="inline-flex items-center"
                >
                  <input
                    type="checkbox"
                    name="languages"
                    value={language}
                    checked={updatedQuiz.languages.includes(language)}
                    onChange={handleLanguageChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{language}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Update Quiz
            </button>
            <button
              type="button"
              onClick={() => onDelete(quiz._id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
            >
              <FaTrash className="mr-2" />
              Delete Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateQuizPopup;
