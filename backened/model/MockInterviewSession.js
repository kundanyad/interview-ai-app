const mongoose = require('mongoose');

const mockInterviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  topics: [String],
  questions: [{
    question: String,
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'situational'],
      default: 'technical'
    },
    expectedTopics: [String]
  }],
  totalQuestions: {
    type: Number,
    required: true
  },
  currentQuestion: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MockInterviewSession', mockInterviewSessionSchema);