const mongoose = require('mongoose');
const Quiz = require('../models/Quiz.js');
const QuizAnalytics = require('../models/quizAnalyticsModel.js');
require('dotenv').config();

async function createAnalyticsForQuizzes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all quizzes
    const quizzes = await Quiz.find({});
    console.log(`Found ${quizzes.length} quizzes`);

    // Create analytics for each quiz
    for (const quiz of quizzes) {
      // Check if analytics already exists
      const existingAnalytics = await QuizAnalytics.findOne({ quiz: quiz._id });
      
      if (!existingAnalytics) {
        // Create new analytics document
        await QuizAnalytics.create({
          quiz: quiz._id,
          totalParticipants: 0,
          completionRatio: 0,
          averageScore: 0,
          participationByStd: new Map(),
          participationByCity: new Map()
        });
        console.log(`Created analytics for quiz: ${quiz.title}`);
      } else {
        console.log(`Analytics already exists for quiz: ${quiz.title}`);
      }
    }

    console.log('Finished creating analytics documents');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAnalyticsForQuizzes(); 