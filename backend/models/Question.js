const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
questionSchema.index({ category: 1, language: 1, difficulty: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question; 