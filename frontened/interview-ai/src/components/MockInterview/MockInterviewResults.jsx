import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { SpinnerLoaderLarge } from '../Loaders/SpinnerLoader';

const MockInterviewResults = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.MOCK_INTERVIEW.GET_RESULTS(sessionId));
      if (response.data.success) {
        setResults(response.data);
      } else {
        throw new Error('Failed to fetch results');
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <SpinnerLoaderLarge />
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h2>
          <button 
            onClick={() => navigate('/mock-interview')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Interview Setup
          </button>
        </div>
      </div>
    );
  }

  const { session, answers, overallScore, totalQuestions, completedQuestions } = results;

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-blue-600 bg-blue-100';
    if (score >= 4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceText = (score) => {
    if (score >= 8) return 'Excellent! 🎉';
    if (score >= 6) return 'Good Job! 👍';
    if (score >= 4) return 'Solid Effort 💪';
    return 'Keep Practicing! 📚';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Results</h1>
          <p className="text-xl text-gray-600">
            {session.role} • {session.experience} years experience
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-6">
            <div className="text-white text-center">
              <div className="text-3xl font-bold">{overallScore}/10</div>
              <div className="text-sm opacity-90">Overall Score</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getPerformanceText(overallScore)}
          </h2>
          <p className="text-gray-600 mb-4">
            You completed {completedQuestions} out of {totalQuestions} questions
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/mock-interview')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Take Another Interview
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-6">
          {answers.map((answer, index) => (
            <div key={answer._id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Question and Answer */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg font-semibold text-gray-900">Question {index + 1}</span>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      answer.questionType === 'technical' 
                        ? 'bg-blue-100 text-blue-800'
                        : answer.questionType === 'behavioral'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {answer.questionType}
                    </span>
                    <div className={`ml-auto px-3 py-1 rounded-full ${getScoreColor(answer.evaluation.score)}`}>
                      <span className="font-semibold">{answer.evaluation.score}/10</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Question:</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{answer.question}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Your Answer:</h3>
                    <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{answer.userAnswer}</p>
                  </div>
                </div>

                {/* Evaluation */}
                <div className="lg:w-96">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">AI Feedback</h4>
                    <p className="text-gray-700 text-sm mb-4">{answer.evaluation.feedback}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium text-green-700 text-sm mb-2">Strengths:</h5>
                        <ul className="text-xs text-green-600 space-y-1">
                          {answer.evaluation.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span>•</span> {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-orange-600 text-sm mb-2">Improvements:</h5>
                        <ul className="text-xs text-orange-600 space-y-1">
                          {answer.evaluation.improvements.map((improvement, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span>•</span> {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/mock-interview')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02]"
          >
            Start New Mock Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewResults;