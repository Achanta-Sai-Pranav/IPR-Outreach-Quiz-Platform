const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1
  },
  passingMarks: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  imageLink: {
    type: String,
    default: ''
  },
  categories: [{
    type: String,
    required: true
  }],
  languages: [{
    type: String,
    required: true
  }],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // New fields for multi-language support
  parentQuiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
  },
  subQuizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  language: {
    type: String,
    default: null
  },
  isMainQuiz: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
quizSchema.index({ title: 1, createdBy: 1 });
quizSchema.index({ parentQuiz: 1 });
quizSchema.index({ isMainQuiz: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz; 