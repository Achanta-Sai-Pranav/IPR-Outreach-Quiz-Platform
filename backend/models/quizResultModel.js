const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  incorrectAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  skippedQuestions: {
    type: Number,
    required: true,
    default: 0
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
quizResultSchema.index({ quizId: 1, userId: 1 });
quizResultSchema.index({ userId: 1, submittedAt: -1 });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = QuizResult; 