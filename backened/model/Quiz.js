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
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    default: ""
  }
})

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  topics: [{
    type: String
  }],
  questions: [questionSchema],
  totalQuestions: {
    type: Number,
    default: 0
  },
  timeLimit: {
    type: Number,
    default: 30
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
})

quizSchema.index({user:1,createdAt:-1})
quizSchema.index({isCompleted:1})

module.exports = mongoose.model('Quiz',quizSchema);