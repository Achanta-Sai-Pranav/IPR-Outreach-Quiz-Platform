const Quiz = require('../models/Quiz.js');
const Question = require('../models/Question.js');
const QuizAttempt = require('../models/QuizAttempt.js');
const User = require('../models/User.js');
const QuizAnalytics = require('../models/quizAnalyticsModel.js');
const QuizResult = require('../models/quizResultModel.js');

exports.createQuiz = async (req, res) => {
  try {
    console.log('Create Quiz Request Body:', req.body);
    console.log('User from request:', req.user);

    const {
      title,
      description,
      duration,
      totalMarks,
      passingMarks,
      categories,
      languages,
      startDate,
      endDate,
      imageLink
    } = req.body;

    if (
      !title ||
      !description ||
      !duration ||
      !totalMarks ||
      !passingMarks ||
      !categories ||
      !languages ||
      !startDate ||
      !endDate
    ) {
      console.log('Missing required fields:', {
        title: !title,
        description: !description,
        duration: !duration,
        totalMarks: !totalMarks,
        passingMarks: !passingMarks,
        categories: !categories,
        languages: !languages,
        startDate: !startDate,
        endDate: !endDate
      });
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Categories must be a non-empty array",
      });
    }

    if (!Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Languages must be a non-empty array",
      });
    }

    // Validate that passing marks don't exceed total marks
    if (passingMarks > totalMarks) {
      return res.status(400).json({
        success: false,
        message: "Passing marks cannot exceed total marks",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Set time to start of day for start date and end of day for end date
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (start < now) {
      return res.status(400).json({
        success: false,
        message: "Start date must be in the future",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Create main quiz first
    const mainQuiz = await Quiz.create({
      title,
      description,
      duration,
      totalMarks,
      passingMarks,
      questions: [], // Main quiz won't have questions directly
      createdBy: req.user.userId,
      categories,
      languages,
      startDate: start,
      endDate: end,
      imageLink: imageLink || "",
      isMainQuiz: true,
      subQuizzes: []
    });

    console.log('Main quiz created successfully:', mainQuiz._id);

    const subQuizzes = [];

    // Create sub-quizzes for each language
    for (const language of languages) {
      // Get questions for this specific language
      const questionsForLanguage = await Question.find({
        category: { $in: categories },
        language: language
      }).limit(totalMarks);

      console.log(`Found ${questionsForLanguage.length} questions for language: ${language}`);

      if (questionsForLanguage.length === 0) {
        console.log(`No questions found for language: ${language}`);
        continue;
      }

      // Check if we have enough questions for this language
      if (questionsForLanguage.length < totalMarks) {
        console.log(`Not enough questions for language ${language}. Found ${questionsForLanguage.length} but need ${totalMarks}`);
        continue;
      }

      // Create sub-quiz for this language
      const subQuiz = await Quiz.create({
        title: `${title} (${language})`,
        description: `${description} - ${language} version`,
        duration,
        totalMarks,
        passingMarks,
        questions: questionsForLanguage.map(q => q._id),
        createdBy: req.user.userId,
        categories,
        languages: [language], // Only this language
        startDate: start,
        endDate: end,
        imageLink: imageLink || "",
        parentQuiz: mainQuiz._id,
        language: language,
        isMainQuiz: false
      });

      console.log(`Sub-quiz created for ${language}:`, subQuiz._id);

      // Create analytics document for the sub-quiz
      try {
        await QuizAnalytics.create({
          quizId: subQuiz._id,
          totalParticipants: 0,
          completionRatio: 0,
          averageScore: 0,
          participationByStd: {},
          participationByCity: {}
        });
        console.log('Analytics created for sub-quiz:', subQuiz._id);
      } catch (analyticsError) {
        console.error('Error creating analytics for sub-quiz:', analyticsError);
      }

      subQuizzes.push(subQuiz._id);
    }

    // Update main quiz with sub-quizzes
    if (subQuizzes.length > 0) {
      await Quiz.findByIdAndUpdate(mainQuiz._id, {
        subQuizzes: subQuizzes
      });
    }

    // Create analytics document for the main quiz
    try {
      await QuizAnalytics.create({
        quizId: mainQuiz._id,
        totalParticipants: 0,
        completionRatio: 0,
        averageScore: 0,
        participationByStd: {},
        participationByCity: {}
      });
      console.log('Analytics created for main quiz:', mainQuiz._id);
    } catch (analyticsError) {
      console.error('Error creating analytics for main quiz:', analyticsError);
    }

    // Return success with the main quiz data
    return res.status(201).json({
      success: true,
      message: `Quiz created successfully with ${subQuizzes.length} language versions`,
      quiz: mainQuiz,
      subQuizzes: subQuizzes
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({
      success: false,
      message: "Failed to create quiz",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      duration,
      totalMarks,
      passingMarks,
      startDate,
      endDate,
      imageLink,
      categories,
      languages
    } = req.body;

    // Validations
    if (
      !title ||
      !description ||
      !duration ||
      !totalMarks ||
      !passingMarks ||
      !startDate ||
      !endDate ||
      !categories ||
      !languages
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Categories must be a non-empty array",
      });
    }

    if (!Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Languages must be a non-empty array",
      });
    }

    // Validate that passing marks don't exceed total marks
    if (passingMarks > totalMarks) {
      return res.status(400).json({
        success: false,
        message: "Passing marks cannot exceed total marks",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (start < now) {
      return res.status(400).json({
        success: false,
        message: "Start date must be in the future",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          description,
          duration,
          totalMarks,
          passingMarks,
          startDate,
          endDate,
          imageLink: imageLink || "",
          categories,
          languages
        },
      },
      { new: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update quiz",
      error: error.message,
    });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // If this is a main quiz, delete all sub-quizzes first
    if (quiz.isMainQuiz && quiz.subQuizzes && quiz.subQuizzes.length > 0) {
      // Delete quiz attempts for all sub-quizzes
      await QuizAttempt.deleteMany({ quiz: { $in: quiz.subQuizzes } });
      
      // Delete quiz results for all sub-quizzes
      await QuizResult.deleteMany({ quizId: { $in: quiz.subQuizzes } });
      
      // Delete analytics for all sub-quizzes
      await QuizAnalytics.deleteMany({ quizId: { $in: quiz.subQuizzes } });
      
      // Delete all sub-quizzes
      await Quiz.deleteMany({ _id: { $in: quiz.subQuizzes } });
    }

    // Delete all quiz attempts for this quiz
    await QuizAttempt.deleteMany({ quiz: id });

    // Delete quiz results for this quiz
    await QuizResult.deleteMany({ quizId: id });

    // Delete analytics for this quiz
    await QuizAnalytics.deleteMany({ quizId: id });

    // Then delete the quiz
    const deletedQuiz = await Quiz.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Quiz and all related data deleted successfully",
      quiz: deletedQuiz,
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete quiz",
      error: error.message,
    });
  }
};

exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true, isMainQuiz: true })
      .populate('createdBy', 'firstName lastName')
      .populate('subQuizzes', 'title language')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
      error: error.message,
    });
  }
};

exports.getSubQuizzes = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
      .populate('subQuizzes', 'title language _id');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (!quiz.isMainQuiz) {
      return res.status(400).json({
        success: false,
        message: "This is not a main quiz",
      });
    }

    res.status(200).json({
      success: true,
      subQuizzes: quiz.subQuizzes || [],
    });
  } catch (error) {
    console.error("Error fetching sub-quizzes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sub-quizzes",
      error: error.message,
    });
  }
};

exports.getQuizQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .populate({
        path: 'questions',
        select: 'question options correctAnswer category language difficulty'
      })
      .populate('subQuizzes', 'title language _id');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // If this is a main quiz with sub-quizzes, return the sub-quizzes
    if (quiz.isMainQuiz && quiz.subQuizzes && quiz.subQuizzes.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This is a main quiz. Please select a language version to start.",
        isMainQuiz: true,
        subQuizzes: quiz.subQuizzes
      });
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this quiz",
      });
    }

    // Remove correct answers from questions
    const questions = quiz.questions.map(q => {
      const question = q.toObject();
      delete question.correctAnswer;
      return question;
    });

    res.status(200).json({
      success: true,
      quiz: {
        ...quiz.toObject(),
        questions,
      },
    });
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz questions",
      error: error.message,
    });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, startTime, endTime } = req.body;
    const userId = req.user.userId;

    if (!quizId || !answers) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID and answers are required",
      });
    }

    // Check if user has already attempted this quiz
    const existingAttempt = await QuizAttempt.findOne({
      quiz: quizId,
      user: userId
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: "You have already attempted this quiz",
      });
    }

    const quiz = await Quiz.findById(quizId)
      .populate({
        path: 'questions',
        select: 'question options correctAnswer category language difficulty'
      });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No questions found for this quiz",
      });
    }

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let skippedQuestions = 0;
    const totalQuestions = quiz.questions.length;
    const answerDetails = [];
    const correctAnswersList = {};

    quiz.questions.forEach(question => {
      const submittedAnswer = answers[question._id];
      const isCorrect = submittedAnswer === question.correctAnswer;
      correctAnswersList[question._id] = question.correctAnswer;

      answerDetails.push({
        question: question._id,
        selectedAnswer: typeof submittedAnswer === 'string' ? submittedAnswer : '',
        isCorrect
      });

      if (!submittedAnswer) {
        skippedQuestions++;
      } else if (isCorrect) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * quiz.totalMarks);
    const isPassed = score >= quiz.passingMarks;

    // Create quiz attempt
    await QuizAttempt.create({
      quiz: quizId,
      user: userId,
      answers: answerDetails,
      score,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isPassed
    });

    // Create quiz result
    const quizResult = await QuizResult.create({
      quizId: quizId,
      userId: userId,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      completed: true,
      timeTaken: Math.round((new Date(endTime) - new Date(startTime)) / 1000)
    });

    // Update user's quiz history
    await User.findByIdAndUpdate(userId, {
      $push: { quizHistory: quizId }
    });

    // Update quiz analytics
    const analytics = await QuizAnalytics.findOne({ quizId });
    if (analytics) {
      analytics.totalParticipants += 1;
      analytics.completionRatio = (analytics.completionRatio * (analytics.totalParticipants - 1) + (skippedQuestions === 0 ? 1 : 0)) / analytics.totalParticipants;
      analytics.averageScore = (analytics.averageScore * (analytics.totalParticipants - 1) + score) / analytics.totalParticipants;
      await analytics.save();
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        score,
        totalMarks: quiz.totalMarks,
        passingMarks: quiz.passingMarks,
        correctAnswers,
        incorrectAnswers,
        skippedQuestions,
        isPassed,
        timeTaken: Math.round((new Date(endTime) - new Date(startTime)) / 1000), // in seconds
        correctAnswersList,
        userName: `${user.firstName} ${user.middleName || ''} ${user.lastName}`.trim(),
        quizName: quiz.title,
        scorePercentage: Math.round((score / quiz.totalMarks) * 100)
      }
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
      error: error.message
    });
  }
};
