const Quiz = require('../model/Quiz');
const QuizResult = require('../model/QuizResult');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

const quizGenerationPrompt = ({ role, experience, topics, numberOfQuestions }) => `
Generate ${numberOfQuestions} multiple choice quiz questions for a ${role} position with ${experience} years of experience, focusing on ${topics}.

Requirements:
- Each question should have 4 options (a, b, c, d)
- Mark the correct answer with its index (0-3)
- Include a brief explanation
- Questions should be relevant to the role and experience level
- Mix difficulty levels appropriately
- Return as valid JSON array

Format:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation why this is correct"
  }
]

Return only valid JSON, no other text.
`;

exports.generateQuiz = async (req, res) => {
  try {
    const { role, experience, topics, numberOfQuestions = 10, timeLimit = 30 } = req.body;

    if (!role || !experience || !topics) {
      return res.status(400).json({ 
        success: false,
        message: 'Role, experience, and topics are required' 
      });
    }

    if (numberOfQuestions < 5 || numberOfQuestions > 20) {
      return res.status(400).json({
        success: false,
        message: 'Number of questions must be between 5 and 20'
      });
    }

    console.log('Generating quiz for:', { role, experience, topics, numberOfQuestions });

    // here generating questions using ai 
    const prompt = quizGenerationPrompt({
      role,
      experience,
      topics: Array.isArray(topics) ? topics.join(', ') : topics,
      numberOfQuestions
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
    })

    const rawText = response.text;
    const cleanedText = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    
    let questions;
    try {
      questions = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw AI response:', rawText);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate quiz questions. Please try again.'
      });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'AI did not generate valid questions'
      });
    }
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || !Array.isArray(question.options) || question.options.length !== 4 || 
          typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer > 3) {
        return res.status(500).json({
          success: false,
          message: `Invalid question format at index ${i}`
        })
      }
    }
    const quiz = await Quiz.create({
      user: req.user._id,
      title: `${role} Quiz - ${experience} years experience`,
      role,
      experience,
      topics: Array.isArray(topics) ? topics : [topics],
      questions,
      totalQuestions: questions.length,
      timeLimit,
      startedAt: new Date()
    });

    console.log('Quiz created successfully:', quiz._id);

    res.status(201).json({ 
      success: true, 
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        role: quiz.role,
        experience: quiz.experience,
        topics: quiz.topics,
        totalQuestions: quiz.totalQuestions,
        timeLimit: quiz.timeLimit,
        isCompleted: quiz.isCompleted,
        createdAt: quiz.createdAt
      }
    })
  } catch (error) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate quiz', 
      error: error.message 
    });
  }
};


exports.getUserQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id }).sort({ createdAt: -1 }).select('-questions');
    
    res.status(200).json({ 
      success: true, 
      quizzes,
      count: quizzes.length
    });
  } catch (error) {
    console.error('Get user quizzes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch quizzes', 
      error: error.message 
    })
  }
}

// Get past  quiz
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }

    if (quiz.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    res.status(200).json({ 
      success: true, 
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        role: quiz.role,
        experience: quiz.experience,
        topics: quiz.topics,
        questions: quiz.questions,
        totalQuestions: quiz.totalQuestions,
        timeLimit: quiz.timeLimit,
        isCompleted: quiz.isCompleted,
        score: quiz.score,
        totalScore: quiz.totalScore,
        startedAt: quiz.startedAt,
        completedAt: quiz.completedAt,
        createdAt: quiz.createdAt
      }
    });
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch quiz', 
      error: error.message 
    });
  }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body;
    
    console.log('Quiz submission received:', { quizId, answersCount: answers?.length, timeSpent });

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        success: false,
        message: 'Quiz ID and answers array are required' 
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }

    if (quiz.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      })
    }

    if (quiz.isCompleted) {
      return res.status(400).json({ 
        success: false,
        message: 'Quiz already submitted' 
      })
    }

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: `Answers array length (${answers.length}) does not match questions count (${quiz.questions.length})`
      });
    }

    // Calculate score only count answer questions that are correct
    let score = 0;
    let answeredCount = 0;
    const detailedAnswers = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      
      // Check if this question was answered (selectedOption is not null)
      if (userAnswer && userAnswer.selectedOption !== null && userAnswer.selectedOption !== undefined) {
        answeredCount++;
        const isCorrect = userAnswer.selectedOption === question.correctAnswer;
        if (isCorrect) score++;
        
        return {
          questionIndex: index,
          selectedOption: userAnswer.selectedOption,
          isCorrect: isCorrect,
          timeTaken: userAnswer.timeTaken || 0
        };
      } else {
        // Question was not answered
        return {
          questionIndex: index,
          selectedOption: null,
          isCorrect: false,
          timeTaken: 0
        };
      }
    });

    const percentage = (score / quiz.questions.length) * 100;
    const accuracy = answeredCount > 0 ? (score / answeredCount) * 100 : 0;

    console.log('Quiz evaluation:', {
      totalQuestions: quiz.questions.length,
      answered: answeredCount,
      correct: score,
      percentage: percentage.toFixed(2),
      accuracy: accuracy.toFixed(2)
    });

    // Save quiz result
    const quizResult = await QuizResult.create({
      user: req.user._id,
      quiz: quizId,
      answers: detailedAnswers,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      accuracy,
      answeredCount,
      timeSpent: timeSpent || 0
    });

    // Update quiz completion status
    quiz.isCompleted = true;
    quiz.score = score;
    quiz.totalScore = quiz.questions.length;
    quiz.completedAt = new Date();
    await quiz.save();

    // Populate the result for response
    await quizResult.populate('quiz');

    res.status(200).json({ 
      success: true, 
      result: {
        _id: quizResult._id,
        score: quizResult.score,
        totalQuestions: quizResult.totalQuestions,
        percentage: quizResult.percentage,
        accuracy: quizResult.accuracy,
        answeredCount: quizResult.answeredCount,
        timeSpent: quizResult.timeSpent,
        answers: quizResult.answers,
        completedAt: quizResult.completedAt,
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          questions: quiz.questions
        }
      },
      summary: {
        totalQuestions: quiz.questions.length,
        answered: answeredCount,
        correct: score,
        percentage: Math.round(percentage),
        accuracy: Math.round(accuracy),
        timeSpent: timeSpent || 0
      }
    });

  } catch (error) {
    console.error("Quiz submission error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit quiz', 
      error: error.message 
    });
  }
};

// Get quiz results and analytics
exports.getQuizResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id })
      .populate('quiz')
      .sort({ completedAt: -1 });

    // Calculate analytics
    const totalQuizzes = results.length;
    const totalQuestions = results.reduce((sum, result) => sum + result.totalQuestions, 0);
    const totalCorrect = results.reduce((sum, result) => sum + result.score, 0);
    const totalTimeSpent = results.reduce((sum, result) => sum + result.timeSpent, 0);
    
    const averageScore = totalQuizzes > 0 
      ? results.reduce((sum, result) => sum + result.percentage, 0) / totalQuizzes 
      : 0;
    
    const averageAccuracy = totalQuizzes > 0
      ? results.reduce((sum, result) => sum + result.accuracy, 0) / totalQuizzes
      : 0;

    const bestScore = totalQuizzes > 0 
      ? Math.max(...results.map(result => result.percentage)) 
      : 0;

    const totalAnswered = results.reduce((sum, result) => sum + result.answeredCount, 0);
    const overallAccuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

    // Calculate performance by topic
    const topicPerformance = {};
    results.forEach(result => {
      if (result.quiz && result.quiz.topics) {
        result.quiz.topics.forEach(topic => {
          if (!topicPerformance[topic]) {
            topicPerformance[topic] = { total: 0, correct: 0, count: 0 };
          }
          topicPerformance[topic].total += result.totalQuestions;
          topicPerformance[topic].correct += result.score;
          topicPerformance[topic].count += 1;
        });
      }
    });

    // Convert to array with percentages
    const topicAnalytics = Object.entries(topicPerformance).map(([topic, data]) => ({
      topic,
      averageScore: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      quizCount: data.count
    })).sort((a, b) => b.averageScore - a.averageScore);

    res.status(200).json({
      success: true,
      results,
      analytics: {
        totalQuizzes,
        totalQuestions,
        totalCorrect,
        totalTimeSpent,
        averageScore: Math.round(averageScore),
        averageAccuracy: Math.round(averageAccuracy),
        bestScore: Math.round(bestScore),
        overallAccuracy: Math.round(overallAccuracy),
        topicAnalytics
      }
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch quiz results', 
      error: error.message 
    });
  }
};

// Get specific quiz result
exports.getQuizResultById = async (req, res) => {
  try {
    const result = await QuizResult.findById(req.params.id)
      .populate('quiz');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Quiz result not found'
      });
    }

    if (result.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Get quiz result by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz result',
      error: error.message
    });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete associated quiz results
    await QuizResult.deleteMany({ quiz: quiz._id });
    
    // Delete the quiz
    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Quiz and associated results deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

// Get quiz statistics for dashboard
exports.getQuizStats = async (req, res) => {
  try {
    const totalQuizzes = await Quiz.countDocuments({ user: req.user._id });
    const completedQuizzes = await Quiz.countDocuments({ 
      user: req.user._id, 
      isCompleted: true 
    });
    const pendingQuizzes = await Quiz.countDocuments({ 
      user: req.user._id, 
      isCompleted: false 
    });

    const recentResults = await QuizResult.find({ user: req.user._id })
      .populate('quiz')
      .sort({ completedAt: -1 })
      .limit(5);

    const averageScore = await QuizResult.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, average: { $avg: '$percentage' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalQuizzes,
        completedQuizzes,
        pendingQuizzes,
        averageScore: averageScore.length > 0 ? Math.round(averageScore[0].average) : 0,
        recentResults: recentResults.map(result => ({
          _id: result._id,
          score: result.score,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
          quizTitle: result.quiz?.title,
          completedAt: result.completedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz statistics',
      error: error.message
    });
  }
};