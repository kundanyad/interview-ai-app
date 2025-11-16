const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateQuiz,
  getUserQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  getQuizResultById,
  deleteQuiz,
  getQuizStats
} = require('../controllers/quizController');

router.post('/generate', protect, generateQuiz);
router.get('/my-quizzes', protect, getUserQuizzes);
router.get('/results', protect, getQuizResults);
router.get('/stats', protect, getQuizStats);
router.get('/:id', protect, getQuizById);
router.get('/result/:id', protect, getQuizResultById);
router.post('/submit', protect, submitQuiz);
router.delete('/:id', protect, deleteQuiz);

module.exports = router;