import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../Inputs/Input';
import { SpinnerLoaderLarge } from '../Loaders/SpinnerLoader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const QuizForm = () => {
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
    topics: "",
    numberOfQuestions: 10,
    timeLimit: 30
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    const { role, experience, topics, numberOfQuestions, timeLimit } = formData;

    if (!role || !experience || !topics) {
      setErrors("Please fill all required fields");
      return;
    }

    setErrors("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.QUIZ.GENERATE, {
        role,
        experience,
        topics,
        numberOfQuestions: parseInt(numberOfQuestions),
        timeLimit: parseInt(timeLimit)
      });

      if (response.data.quiz?._id) {
        navigate(`/quiz/${response.data.quiz._id}`);
      }
    } catch (error) {
      setErrors(error.response?.data?.message || "Failed to generate quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Predefined options for quick selection
  const quickRoles = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "Data Scientist"];
  const quickTopics = ["React", "JavaScript", "Node.js", "Python", "System Design", "Algorithms", "Database", "CSS"];

  const handleQuickSelect = (type, value) => {
    if (type === 'role') {
      setFormData(prev => ({ ...prev, role: value }));
    } else if (type === 'topics') {
      setFormData(prev => ({ 
        ...prev, 
        topics: prev.topics ? `${prev.topics}, ${value}` : value 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Quiz</h1>
            <p className="text-gray-600 text-lg">
              Generate a personalized quiz tailored to your career goals and skill level
            </p>
          </div>

          <form onSubmit={handleGenerateQuiz} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-900">
                  Target Role *
                </label>
                <span className="text-xs text-gray-500">Required</span>
              </div>
              
              <Input
                value={formData.role}
                onChange={(val) => handleChange("role", val)}
                placeholder="What role are you preparing for? (e.g., Senior Frontend Engineer, Junior Backend Developer)"
                type="text"
                required
              />
              
              {/* Quick Role Selection */}
              <div className="flex flex-wrap gap-2">
                {quickRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleQuickSelect('role', role)}
                    className={`px-3 py-2 text-sm rounded-full border transition-all ${
                      formData.role === role
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-900">
                  Years of Experience *
                </label>
                <span className="text-xs text-gray-500">Required</span>
              </div>
              
              <Input
                value={formData.experience}
                onChange={(val) => handleChange("experience", val)}
                placeholder="How many years of professional experience do you have?"
                type="number"
                min="0"
                max="20"
                required
              />
              
              <div className="flex gap-4 text-xs text-gray-600">
                <span>💼 0-2 years: Entry Level</span>
                <span>🚀 3-5 years: Mid Level</span>
                <span>🎯 5+ years: Senior Level</span>
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-900">
                  Topics to Focus On *
                </label>
                <span className="text-xs text-gray-500">Required</span>
              </div>
              
              <Input
                value={formData.topics}
                onChange={(val) => handleChange("topics", val)}
                placeholder="Which technologies or concepts do you want to focus on? (e.g., React Hooks, System Design, Database Optimization)"
                type="text"
                required
              />
              
              {/* Quick Topics Selection */}
              <div className="flex flex-wrap gap-2">
                {quickTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleQuickSelect('topics', topic)}
                    className={`px-3 py-2 text-sm rounded-full border transition-all ${
                      formData.topics.includes(topic)
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-green-300'
                    }`}
                  >
                    {topic} {formData.topics.includes(topic) && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Number of Questions
                </label>
                <div className="space-y-2">
                  <Input
                    value={formData.numberOfQuestions}
                    onChange={(val) => handleChange("numberOfQuestions", val)}
                    type="number"
                    min="5"
                    max="20"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Quick (5)</span>
                    <span>Standard (10)</span>
                    <span>Comprehensive (20)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Time Limit (minutes)
                </label>
                <div className="space-y-2">
                  <Input
                    value={formData.timeLimit}
                    onChange={(val) => handleChange("timeLimit", val)}
                    type="number"
                    min="10"
                    max="120"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Short (10)</span>
                    <span>Standard (30)</span>
                    <span>Extended (60+)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {errors && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm">{errors}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <SpinnerLoaderLarge />
                  <span>Generating Your Quiz...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Quiz</span>
                </div>
              )}
            </button>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                ✨ Your quiz will be AI-generated based on industry standards and best practices
              </p>
            </div>
          </form>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Industry Relevant</h3>
            <p className="text-sm text-gray-600">Questions based on real-world scenarios and current industry standards</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Timed Practice</h3>
            <p className="text-sm text-gray-600">Simulate real interview conditions with customizable time limits</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
            <p className="text-sm text-gray-600">Track your progress and identify areas for improvement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { QuizForm };