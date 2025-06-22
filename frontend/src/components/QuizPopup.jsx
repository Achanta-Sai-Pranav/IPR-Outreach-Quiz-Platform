import { Transition } from "@headlessui/react";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaRegCheckCircle, FaTimes, FaLanguage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig.jsx";

const Popup = ({ show, onClose, quizId, alreadyAttempted }) => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const [subQuizzes, setSubQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const popupRef = useRef();

  useEffect(() => {
    if (show && quizId) {
      fetchSubQuizzes();
    }
  }, [show, quizId]);

  // Close on outside click
  useEffect(() => {
    if (!show) return;
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);

  const fetchSubQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`quiz/get-sub-quizzes/${quizId}`);
      if (response.data.success) {
        setSubQuizzes(response.data.subQuizzes);
      }
    } catch (error) {
      console.error("Error fetching sub-quizzes:", error);
      // If no sub-quizzes found, it might be a regular quiz
      setSubQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (subQuizzes.length > 0 && selectedLanguage) {
      // Navigate to the selected sub-quiz
      const selectedSubQuiz = subQuizzes.find(sub => sub.language === selectedLanguage);
      if (selectedSubQuiz) {
        navigate(`/quiz/${selectedSubQuiz._id}`);
      }
    } else {
      // Navigate to the main quiz (for backward compatibility)
      navigate(`/quiz/${quizId}`);
    }
    onClose();
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  return (
    <Transition
      show={show}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div ref={popupRef} className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg p-6 w-full max-w-md sm:max-w-lg md:max-w-xl m-4 max-h-[28rem] overflow-y-auto">
          {alreadyAttempted ? (
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">{t('alreadyAttempted') || 'You have already attempted this quiz.'}</h2>
              <button
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300 ease-in-out flex items-center justify-center mt-4"
              >
                <FaTimes className="mr-2 text-gray-600" />
                {t('close')}
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaRegCheckCircle className="mr-2 text-green-500" />
                {subQuizzes.length > 0 ? "Select Language" : t("rules")}
              </h2>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading languages...</p>
                </div>
              ) : subQuizzes.length > 0 ? (
                <div className="mb-4">
                  <p className="text-gray-700 mb-4">Please select a language for your quiz:</p>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {subQuizzes.map((subQuiz) => (
                      <button
                        key={subQuiz._id}
                        onClick={() => handleLanguageSelect(subQuiz.language)}
                        className={`w-full p-3 rounded-lg border-2 transition-all duration-300 flex items-center ${
                          selectedLanguage === subQuiz.language
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <FaLanguage className="mr-2" />
                        <span className="capitalize">{subQuiz.language}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <ul className="list-disc list-inside mb-4 text-base">
                  <li>{t("quizRules.time")}</li>
                  <li>{t("quizRules.questions")}</li>
                  <li>{t("quizRules.options")}</li>
                  <li>{t("quizRules.skip")}</li>
                  <li>{t("quizRules.results")}</li>
                </ul>
              )}
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={onClose}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300 ease-in-out flex items-center justify-center"
                >
                  <FaTimes className="mr-2 text-gray-600" />
                  {t("close")}
                </button>
                <button
                  onClick={handleStart}
                  disabled={subQuizzes.length > 0 && !selectedLanguage}
                  className={`w-full sm:w-auto text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out flex items-center justify-center
                    bg-orange-500 hover:bg-orange-600
                    ${(subQuizzes.length > 0 && !selectedLanguage) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FaRegCheckCircle className="mr-2 text-white" />
                  {subQuizzes.length > 0 ? "Start Quiz" : t("start")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Transition>
  );
};

export default Popup;
