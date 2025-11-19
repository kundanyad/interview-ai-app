const { GoogleGenAI } = require('@google/genai');
const MockInterview = require('../model/MockInterview');
const MockInterviewSession = require('../model/MockInterviewSession');

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const mockInterviewPrompt = ({ role, experience, topics, numberOfQuestions }) => `
Generate ${numberOfQuestions} realistic interview questions for a ${role} position with ${experience} years of experience, focusing on ${topics}.

Requirements:
- Questions should simulate real interview scenarios
- Include behavioral, technical, and situational questions
- Questions should be challenging but appropriate for the experience level
- Return as valid JSON array

Format:
[
  {
    "question": "Interview question text?",
    "type": "technical|behavioral|situational",
    "expectedTopics": ["topic1", "topic2"]
  }
]

Return only valid JSON, no other text.
`;

const evaluationPrompt = (question, userAnswer, questionType) => `
Evaluate the following interview answer and provide constructive feedback:

QUESTION: "${question}"
QUESTION TYPE: ${questionType}
USER'S ANSWER: "${userAnswer}"

Provide evaluation in this JSON format:
{
  "score": 0-10,
  "feedback": "Detailed feedback on what was good and what needs improvement",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "suggestedAnswer": "A model answer for reference"
}

Be constructive and helpful. Focus on communication skills, technical accuracy, and relevance.
Return only valid JSON, no other text.
`;

exports.generateMockInterview = async (req, res) => {
  try {
    const { role, experience, topics, numberOfQuestions = 5 } = req.body;

    if (!role || !experience || !topics) {
      return res.status(400).json({
        success: false,
        message: 'Role, experience, and topics are required'
      });
    }

    const prompt = mockInterviewPrompt({
      role,
      experience,
      topics: Array.isArray(topics) ? topics.join(', ') : topics,
      numberOfQuestions
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
    });

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
        message: 'Failed to generate interview questions'
      });
    }

    // Validate questions structure
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'AI did not generate valid questions'
      });
    }

    const session = await MockInterviewSession.create({
      user: req.user._id,
      role,
      experience,
      topics: Array.isArray(topics) ? topics : [topics],
      questions,
      totalQuestions: questions.length,
      currentQuestion: 0,
      status: 'in-progress'
    });

    res.status(201).json({
      success: true,
      session: {
        _id: session._id,
        questions: session.questions,
        totalQuestions: session.totalQuestions,
        currentQuestion: session.currentQuestion
      }
    });

  } catch (error) {
    console.error("Mock interview generation error:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate mock interview',
      error: error.message
    });
  }
};

exports.submitInterviewAnswer = async (req, res) => {
  try {
    const { sessionId, questionIndex, userAnswer, audioDuration } = req.body;

    if (!sessionId || questionIndex === undefined || !userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, question index, and answer are required'
      });
    }

    const session = await MockInterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (questionIndex >= session.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }

    const currentQuestion = session.questions[questionIndex];
    
    // Get AI evaluation
    const prompt = evaluationPrompt(
      currentQuestion.question, 
      userAnswer, 
      currentQuestion.type
    );

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
    });

    const rawText = response.text;
    const cleanedText = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    
    let evaluation;
    try {
      evaluation = JSON.parse(cleanedText);
      
      // Validate evaluation structure
      if (typeof evaluation.score !== 'number' || !evaluation.feedback) {
        throw new Error("Invalid evaluation structure");
      }
    } catch (parseError) {
      console.error('Failed to parse evaluation:', parseError);
      evaluation = {
        score: 5,
        feedback: "Unable to evaluate this response properly. Please try again with a more detailed answer.",
        strengths: ["Answer provided"],
        improvements: ["Could not evaluate content properly"],
        suggestedAnswer: "Evaluation unavailable due to technical issues."
      };
    }

    // Save the answer and evaluation
    const interviewAnswer = await MockInterview.create({
      session: sessionId,
      user: req.user._id,
      question: currentQuestion.question,
      questionType: currentQuestion.type,
      userAnswer,
      evaluation,
      audioDuration: audioDuration || 0,
      questionIndex
    });

    // Update session progress
    session.currentQuestion = questionIndex + 1;
    if (session.currentQuestion >= session.totalQuestions) {
      session.status = 'completed';
      session.completedAt = new Date();
    }
    await session.save();

    res.status(200).json({
      success: true,
      evaluation,
      nextQuestionIndex: session.currentQuestion,
      isCompleted: session.status === 'completed',
      answerId: interviewAnswer._id
    });

  } catch (error) {
    console.error("Answer submission error:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate answer',
      error: error.message
    });
  }
};

exports.getMockInterviewResults = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await MockInterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const answers = await MockInterview.find({ session: sessionId })
      .sort('questionIndex');

    const overallScore = answers.length > 0 
      ? answers.reduce((sum, answer) => sum + answer.evaluation.score, 0) / answers.length 
      : 0;

    res.status(200).json({
      success: true,
      session,
      answers,
      overallScore: Math.round(overallScore * 10) / 10,
      totalQuestions: session.totalQuestions,
      completedQuestions: answers.length
    });

  } catch (error) {
    console.error("Get results error:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
      error: error.message
    });
  }
};

exports.getUserMockInterviews = async (req, res) => {
  try {
    const sessions = await MockInterviewSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-questions');

    res.status(200).json({
      success: true,
      sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error("Get user interviews error:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview sessions',
      error: error.message
    });
  }
};