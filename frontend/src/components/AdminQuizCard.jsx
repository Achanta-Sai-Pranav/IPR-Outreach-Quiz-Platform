import {
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaQuestionCircle,
  FaLanguage,
} from "react-icons/fa";

const AdminQuizCard = ({ quiz, onEdit }) => {
  const currentDate = new Date();
  const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
  const endDate = quiz.endDate ? new Date(quiz.endDate) : null;

  const isOngoing = startDate && endDate && currentDate >= startDate && currentDate <= endDate;
  const isUpcoming = startDate && currentDate < startDate;

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return 0;
    const timeDiff = targetDate.getTime() - currentDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  return (
    <div className="bg-white bg-opacity-60 backdrop-blur-md shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105 duration-300 ease-in-out border border-orange-200">
      <img
        src={quiz.imageLink || "https://via.placeholder.com/400x200?text=No+Image"}
        alt={quiz.title}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />
      <h3 className="text-lg font-semibold mb-2 text-orange-700 flex items-center">
        <FaQuestionCircle className="mr-2 text-yellow-500" />
        {quiz.title}
      </h3>
      <p className="text-gray-600 mb-2">{quiz.description}</p>
      <div className="flex flex-wrap text-gray-600 mb-2">
        {(quiz.categories || []).map((category, index) => (
          <span
            key={index}
            className="flex items-center mr-2 mb-1 bg-yellow-200 rounded-[5%] p-1"
          >
            {category}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap text-gray-600 mb-2">
        <FaLanguage className="mr-1 text-blue-500" />
        {(quiz.languages || []).map((language, index) => (
          <span
            key={index}
            className="flex items-center mr-2 mb-1 bg-blue-200 rounded-[5%] p-1"
          >
            {language}
          </span>
        ))}
      </div>
      
      {/* Show sub-quizzes information */}
      {quiz.subQuizzes && quiz.subQuizzes.length > 0 && (
        <div className="mb-2 p-2 bg-green-50 rounded border border-green-200">
          <p className="text-xs text-green-700 font-medium mb-1">
            Sub-quizzes created:
          </p>
          <div className="flex flex-wrap gap-1">
            {quiz.subQuizzes.map((subQuiz, index) => (
              <span
                key={index}
                className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded"
              >
                {subQuiz.language}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-gray-500 mb-2">
        {isOngoing && endDate && (
          <p className="flex items-center">
            <FaClock className="mr-1 text-red-500" />
            Quiz ending in {getDaysRemaining(endDate)} Days
          </p>
        )}
        {isUpcoming && startDate && (
          <p className="flex items-center">
            <FaCalendarAlt className="mr-1 text-purple-500" />
            Quiz will start in {getDaysRemaining(startDate)} Days
          </p>
        )}
        {!isOngoing && !isUpcoming && (
          <p className="flex items-center">
            <FaCalendarAlt className="mr-1 text-gray-500" />
            Quiz submission is Closed now
          </p>
        )}
      </div>
      <button
        onClick={onEdit}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out flex items-center"
      >
        <FaEdit className="mr-2" />
        Edit Quiz
      </button>
    </div>
  );
};

export default AdminQuizCard;
