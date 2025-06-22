const mongoose = require('mongoose');

const quizAnalyticsSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    unique: true,
    index: true
  },
  totalParticipants: {
    type: Number,
    default: 0
  },
  completionRatio: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  participationByStd: {
    type: Object,
    default: {}
  },
  participationByCity: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const QuizAnalytics = mongoose.model('QuizAnalytics', quizAnalyticsSchema);

module.exports = QuizAnalytics; 