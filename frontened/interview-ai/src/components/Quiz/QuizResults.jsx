import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Navbar } from '../layouts/Navbar';

const QuizResults = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    if (!result) {
      fetchResult();
    } else {
      fetchQuiz();
    }
  }, [quizId, result]);

  const fetchResult = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.QUIZ.RESULTS);
      const quizResult = response.data.results.find(r => r.quiz._id === quizId);
      setResult(quizResult);
      setQuiz(quizResult.quiz);
    } catch (error) {
      console.error('Failed to fetch result:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuiz = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.QUIZ.GET_ONE(quizId));
      setQuiz(response.data.quiz);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 80) return 'Excellent!';
    if (percentage >= 60) return 'Good job!';
    if (percentage >= 40) return 'Not bad!';
    return 'Keep practicing!';
  };

  if (loading) return <div className="flex justify-center p-8">Loading results...</div>;
  if (!result || !quiz) return <div className="flex justify-center p-8">Results not found</div>;

  return (
    <Navbar/> &&
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
        <p className="text-gray-600 mb-6">{getScoreMessage(result.percentage)}</p>
        
        <div className="flex justify-center items-center space-x-8 mb-6">
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(result.percentage)}`}>
              {Math.round(result.percentage)}%
            </div>
            <div className="text-gray-600">Score</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">
              {result.score}/{result.totalQuestions}
            </div>
            <div className="text-gray-600">Correct Answers</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">
              {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-gray-600">Time Spent</div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Link to="/quiz" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
            Take Another Quiz
          </Link>
          <Link to="/quiz/history" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            View All Results
          </Link>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Results</h2>
        <div className="space-y-4">
          {quiz.questions.map((question, index) => {
            const userAnswer = result.answers.find(a => a.questionIndex === index);
            const isCorrect = userAnswer?.isCorrect;
            
            return (
              <div key={index} className={`border-l-4 p-4 ${
                isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}>
                <h3 className="font-semibold mb-2">
                  {index + 1}. {question.question}
                </h3>
                
                <div className="space-y-2 ml-4">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className={`p-2 rounded ${
                      optIndex === question.correctAnswer
                        ? 'bg-green-100 border border-green-300'
                        : optIndex === userAnswer?.selectedOption && !isCorrect
                        ? 'bg-red-100 border border-red-300'
                        : 'bg-gray-50'
                    }`}>
                      <span className="font-medium">
                        {String.fromCharCode(65 + optIndex)}.
                      </span> {option}
                      {optIndex === question.correctAnswer && (
                        <span className="text-green-600 font-medium ml-2">✓ Correct Answer</span>
                      )}
                      {optIndex === userAnswer?.selectedOption && !isCorrect && (
                        <span className="text-red-600 font-medium ml-2">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
                
                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { QuizResults };