const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockInterviewSession',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['technical', 'behavioral', 'situational'],
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  evaluation: {
    score: {
      type: Number,
      min: 0,
      max: 10
    },
    feedback: String,
    strengths: [String],
    improvements: [String],
    suggestedAnswer: String
  },
  audioDuration: {
    type: Number
  },
  questionIndex: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MockInterview', mockInterviewSchema);