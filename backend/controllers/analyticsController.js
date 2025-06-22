const QuizAnalytics = require("../models/quizAnalyticsModel");
const QuizResult = require("../models/quizResultModel");
const Quiz = require("../models/Quiz");
const excel = require('exceljs');
const User = require("../models/User");

exports.getAnalyticsData = async (req, res) => {
  try {
    const { quizId } = req.params;
    if (!quizId) {
      return res.status(400).json({ 
        success: false,
        message: "Quiz ID is required" 
      });
    }

    // Fetch the quiz
    const quiz = await Quiz.findById(quizId).populate('subQuizzes', '_id');
    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: "Quiz not found" 
      });
    }

    let quizIdsToAggregate = [quiz._id];
    let isMainQuiz = quiz.isMainQuiz;
    if (isMainQuiz && quiz.subQuizzes && quiz.subQuizzes.length > 0) {
      quizIdsToAggregate = quiz.subQuizzes.map(q => q._id);
    }

    // Get quiz results for all relevant quizIds
    const quizResults = await QuizResult.find({ quizId: { $in: quizIdsToAggregate } })
      .populate({
        path: 'userId',
        select: 'firstName lastName email standard city',
        options: { lean: true }
      });

    // Calculate analytics
    const totalParticipants = quizResults.length;
    const completedQuizzes = quizResults.filter(result => result.completed).length;
    const completionRatio = totalParticipants > 0 ? completedQuizzes / totalParticipants : 0;
    let totalScore = 0;
    quizResults.forEach(result => {
      if (result.score !== undefined) {
        totalScore += result.score;
      }
    });
    const averageScore = totalParticipants > 0 ? (totalScore / totalParticipants) : 0;

    // Calculate participation by standard and city
    const participationByStd = {};
    const participationByCity = {};
    quizResults.forEach(result => {
      if (result.userId) {
        const std = result.userId.standard?.toString() || 'N/A';
        const city = result.userId.city || 'N/A';
        participationByStd[std] = (participationByStd[std] || 0) + 1;
        participationByCity[city] = (participationByCity[city] || 0) + 1;
      }
    });

    // Calculate top performers
    const topPerformers = quizResults
      .filter(result => result.userId)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(result => ({
        name: `${result.userId.firstName || ''} ${result.userId.lastName || ''}`.trim() || 'Anonymous',
        city: result.userId.city || 'N/A',
        std: result.userId.standard?.toString() || 'N/A',
        score: result.score || 0,
        timeTaken: result.timeTaken || 0,
      }));

    // Update analytics in database for this quizId (main or sub)
    await QuizAnalytics.findOneAndUpdate(
      { quizId },
      {
        totalParticipants,
        completionRatio,
        averageScore,
        participationByStd,
        participationByCity
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        totalParticipants,
        completionRatio,
        averageScore,
        participationByStd,
        participationByCity,
        topPerformers,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.exportQuizResultsToExcel = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({ 
        success: false,
        message: "Quiz ID is required" 
      });
    }

    // Fetch the quiz and its sub-quizzes
    const quiz = await Quiz.findById(quizId).populate('subQuizzes', '_id title');
    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: "Quiz not found" 
      });
    }

    let quizIdsToAggregate = [quiz._id];
    let isMainQuiz = quiz.isMainQuiz;
    let quizTitle = quiz.title;
    if (isMainQuiz && quiz.subQuizzes && quiz.subQuizzes.length > 0) {
      quizIdsToAggregate = quiz.subQuizzes.map(q => q._id);
    }

    // Get all quiz results for the relevant quizIds
    const quizResults = await QuizResult.find({ quizId: { $in: quizIdsToAggregate } })
      .populate({
        path: 'userId',
        select: 'firstName middleName lastName email mobileNumber dateOfBirth schoolName standard city',
        options: { lean: true }
      })
      .populate({
        path: 'quizId',
        select: 'title language',
        options: { lean: true }
      });

    if (!quizResults || quizResults.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "No results found for this quiz" 
      });
    }

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Quiz Results');

    worksheet.columns = [
      { header: 'Quiz Title', key: 'quizTitle', width: 30 },
      { header: 'Language', key: 'language', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Mobile Number', key: 'mobileNumber', width: 15 },
      { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
      { header: 'School Name', key: 'schoolName', width: 20 },
      { header: 'Standard', key: 'standard', width: 10 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Correct Answers', key: 'correctAnswers', width: 15 },
      { header: 'Incorrect Answers', key: 'incorrectAnswers', width: 15 },
      { header: 'Skipped Questions', key: 'skippedQuestions', width: 15 },
      { header: 'Time Taken (s)', key: 'timeTaken', width: 15 },
      { header: 'Submitted At', key: 'submittedAt', width: 22 },
    ];

    quizResults.forEach(result => {
      if (!result.userId || !result.quizId) return; // Skip results with no user or quiz data
      worksheet.addRow({
        quizTitle: result.quizId.title || quizTitle || 'N/A',
        language: result.quizId.language || 'N/A',
        name: `${result.userId.firstName || ''} ${result.userId.middleName || ''} ${result.userId.lastName || ''}`.trim() || 'Anonymous',
        email: result.userId.email || 'N/A',
        mobileNumber: result.userId.mobileNumber || 'N/A',
        dateOfBirth: result.userId.dateOfBirth || 'N/A',
        schoolName: result.userId.schoolName || 'N/A',
        standard: result.userId.standard || 'N/A',
        city: result.userId.city || 'N/A',
        score: result.score || 0,
        correctAnswers: result.correctAnswers || 0,
        incorrectAnswers: result.incorrectAnswers || 0,
        skippedQuestions: result.skippedQuestions || 0,
        timeTaken: result.timeTaken || 0,
        submittedAt: result.submittedAt ? new Date(result.submittedAt).toLocaleString('en-IN', { hour12: false }) : 'N/A',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${quizTitle || 'quiz'}_results.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting quiz results:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.exportAllUsersToExcel = async (req, res) => {
  try {
    const users = await User.find({})
      .select('firstName middleName lastName email mobileNumber dateOfBirth schoolName standard city createdAt')
      .lean();

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found"
      });
    }

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Users Data');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Mobile Number', key: 'mobileNumber', width: 15 },
      { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
      { header: 'School Name', key: 'schoolName', width: 20 },
      { header: 'Standard', key: 'standard', width: 10 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'Registration Date', key: 'createdAt', width: 22 },
    ];

    users.forEach(user => {
      worksheet.addRow({
        name: `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
        email: user.email || 'N/A',
        mobileNumber: user.mobileNumber || 'N/A',
        dateOfBirth: user.dateOfBirth || 'N/A',
        schoolName: user.schoolName || 'N/A',
        standard: user.standard || 'N/A',
        city: user.city || 'N/A',
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString('en-IN', { hour12: false }) : 'N/A',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users_data.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting users data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
