const express = require('express');

const router = express.Router();
// Fix: Corrected controller import path to match filename
const { togglePinQuestion, updateQuestion, addQuestionsToSession } = require('../controllers/questionsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addQuestionsToSession);
router.post('/:id/pin', protect, togglePinQuestion);
router.post('/:id/note', protect, updateQuestion);

module.exports = router;