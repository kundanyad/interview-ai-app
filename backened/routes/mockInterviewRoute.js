const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateMockInterview,
  submitInterviewAnswer,
  getMockInterviewResults,
  getUserMockInterviews
} = require('../controllers/mockInterviewController');

router.post('/generate', protect, generateMockInterview);
router.post('/submit-answer', protect, submitInterviewAnswer);
router.get('/results/:sessionId', protect, getMockInterviewResults);
router.get('/my-interviews', protect, getUserMockInterviews);

module.exports = router;