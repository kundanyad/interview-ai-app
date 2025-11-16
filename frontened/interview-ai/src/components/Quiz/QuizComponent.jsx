import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const QuizComponent = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    fetchQuiz();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.QUIZ.GET_ONE(quizId));
      setQuiz(response.data.quiz);
      if (response.data.quiz.isCompleted) {
        navigate(`/quiz/results/${quizId}`);
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(quiz.timeLimit * 60);
    startTimeRef.current = Date.now();
    
    // Start timer that only updates timeLeft and timeSpent
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        setTimeSpent(quiz.timeLimit * 60 - newTime);
        return newTime;
      });
    }, 1000);
  };

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      selectedOption: optionIndex,
      timeTaken: 0
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    
    // Check if user has answered at least one question
    const answeredCount = answers.filter(answer => answer !== undefined).length;
    if (answeredCount === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    // Confirm submission
    const confirmSubmit = window.confirm(
      `You have answered ${answeredCount} out of ${quiz.questions.length} questions. Are you sure you want to submit?`
    );
    
    if (!confirmSubmit) return;
    
    setSubmitting(true);
    
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    try {
      console.log('Submitting quiz...');
      console.log('Answers to submit:', answers);
      
      // Calculate final time spent
      const finalTimeSpent = timeSpent || (quiz.timeLimit * 60 - timeLeft);
      
      // Only submit answered questions - filter out undefined answers
      const answeredQuestions = answers.filter((answer, index) => answer !== undefined);
      
      // Create the answers array in the correct format for backend
      const submissionAnswers = quiz.questions.map((_, index) => {
        // If question was answered, include it, otherwise mark as unanswered
        if (answers[index]) {
          return answers[index];
        } else {
          return { selectedOption: null, timeTaken: 0 }; // Mark as unanswered
        }
      });
      
      console.log('Submission answers:', submissionAnswers);
      
      const response = await axiosInstance.post(API_PATHS.QUIZ.SUBMIT, {
        quizId,
        answers: submissionAnswers,
        timeSpent: finalTimeSpent
      });
      
      console.log('Quiz submitted successfully');
      
      navigate(`/quiz/results/${quizId}`, { 
        state: { result: response.data.result } 
      });
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      setSubmitting(false);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) return <div className="flex justify-center p-8">Loading quiz...</div>;
  if (!quiz) return <div className="flex justify-center p-8">Quiz not found</div>;

  // Show start screen if quiz hasn't started
  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{quiz.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{quiz.totalQuestions}</div>
              <div className="text-gray-600">Questions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{quiz.timeLimit} min</div>
              <div className="text-gray-600">Time Limit</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {quiz.topics.slice(0, 2).join(', ')}
                {quiz.topics.length > 2 && '...'}
              </div>
              <div className="text-gray-600">Topics</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
            <ul className="text-left text-yellow-700 text-sm space-y-1">
              <li>• You have {quiz.timeLimit} minutes to complete the quiz</li>
              <li>• The timer will count down but won't auto-submit</li>
              <li>• You must manually submit when you're finished</li>
              <li>• You can navigate between questions</li>
              <li>• Once submitted, you cannot retake the quiz</li>
              <li>• Only answered questions will be evaluated</li>
            </ul>
          </div>

          <button
            onClick={startQuiz}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredQuestions = answers.filter(answer => answer !== undefined).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
          <div className={`text-lg font-semibold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>
            Time Left: {formatTime(timeLeft)}
            {timeLeft <= 0 && <span className="text-red-500 ml-2">(Time's up!)</span>}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>Answered: {answeredQuestions}/{quiz.questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">{currentQ.question}</h2>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                answers[currentQuestion]?.selectedOption === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
        
        {/* Current question status */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {answers[currentQuestion] 
              ? `✓ You have selected option ${String.fromCharCode(65 + answers[currentQuestion].selectedOption)}`
              : '○ This question is not yet answered'
            }
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
        
        <div className="text-sm text-gray-600">
          Questions: 
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`mx-1 w-8 h-8 rounded-full text-xs ${
                index === currentQuestion
                  ? 'bg-blue-600 text-white'
                  : answers[index]
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleSubmitQuiz}
          disabled={submitting}
          className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors"
        >
          {submitting ? 'Submitting...' : `Submit (${answeredQuestions}/${quiz.questions.length})`}
        </button>
      </div>

      {/* Quiz Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Quiz Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-blue-600">{answeredQuestions}</div>
            <div className="text-blue-700">Answered</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-600">{quiz.questions.length - answeredQuestions}</div>
            <div className="text-gray-700">Unanswered</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-600">{Math.round((answeredQuestions / quiz.questions.length) * 100)}%</div>
            <div className="text-green-700">Completion</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-purple-600">{formatTime(timeLeft)}</div>
            <div className="text-purple-700">Remaining</div>
          </div>
        </div>
      </div>

      {/* Warning if time is up */}
      {timeLeft <= 0 && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-center">
          <p className="text-red-700 font-semibold">
            Time's up! Please submit your quiz.
          </p>
        </div>
      )}
    </div>
  );
};

export { QuizComponent };