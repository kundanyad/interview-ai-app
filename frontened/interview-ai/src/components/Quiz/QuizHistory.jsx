import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Navbar } from '../layouts/Navbar';

const QuizHistory = () => {
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.QUIZ.RESULTS);
      setResults(response.data.results);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) return <div className="flex justify-center p-8">Loading history...</div>;

  return (
    
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Analytics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{analytics.totalQuizzes}</div>
              <div className="text-gray-600">Total Quizzes</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{analytics.averageScore}%</div>
              <div className="text-gray-600">Average Score</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{analytics.bestScore}%</div>
              <div className="text-gray-600">Best Score</div>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-800">Quiz History</h1>
          </div>
          
          <div className="divide-y">
            {results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No quiz results yet. <Link to="/quiz" className="text-blue-600 hover:underline">Take your first quiz!</Link>
              </div>
            ) : (
              results.map((result) => (
                <div key={result._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{result.quiz.title}</h3>
                      <p className="text-gray-600 text-sm">
                        Completed on {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getScoreColor(result.percentage)}`}>
                        {Math.round(result.percentage)}%
                      </div>
                      <div className="text-gray-600 text-sm">
                        {result.score}/{result.totalQuestions} correct
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      Time: {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
                    </span>
                    <Link 
                      to={`/quiz/results/${result.quiz._id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizHistory; // Default export for pages