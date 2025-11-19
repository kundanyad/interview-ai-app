import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../Inputs/Input';
import { SpinnerLoaderLarge } from '../Loaders/SpinnerLoader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const MockInterviewForm = () => {
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
    topics: "",
    numberOfQuestions: 5
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

  const handleGenerateInterview = async (e) => {
    e.preventDefault();
    const { role, experience, topics, numberOfQuestions } = formData;

    if (!role || !experience || !topics) {
      setErrors("Please fill all required fields");
      return;
    }

    if (numberOfQuestions < 3 || numberOfQuestions > 10) {
      setErrors("Number of questions must be between 3 and 10");
      return;
    }

    setErrors("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.MOCK_INTERVIEW.GENERATE, {
        role,
        experience,
        topics,
        numberOfQuestions: parseInt(numberOfQuestions)
      });

      if (response.data.success && response.data.session?._id) {
        navigate(`/mock-interview/session/${response.data.session._id}`);
      } else {
        setErrors("Failed to generate interview session");
      }
    } catch (error) {
      setErrors(error.response?.data?.message || "Failed to generate interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickRoles = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "Data Scientist", "Mobile Developer", "UI/UX Designer"];
  const quickTopics = ["React", "JavaScript", "Node.js", "Python", "Java", "System Design", "Algorithms", "Database", "CSS", "HTML", "APIs", "Testing"];

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Mock Interview</h1>
            <p className="text-gray-600 text-lg">
              Practice with AI-powered interviews and get instant feedback on your answers
            </p>
          </div>

          <form onSubmit={handleGenerateInterview} className="space-y-6">
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
                placeholder="What role are you interviewing for? (e.g., Senior Frontend Developer)"
                type="text"
                required
              />
              
              <div className="flex flex-wrap gap-2">
                {quickRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleQuickSelect('role', role)}
                    className={`px-3 py-2 text-sm rounded-full border transition-all ${
                      formData.role === role
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-300'
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
                placeholder="Years of professional experience (e.g., 2, 5, 10)"
                type="number"
                min="0"
                max="30"
                step="1"
                required
              />
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
                placeholder="Technologies and concepts to focus on (e.g., React, System Design, Databases)"
                type="text"
                required
              />
              
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

            {/* Questions Count */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-900">
                Number of Questions
              </label>
              <Input
                value={formData.numberOfQuestions}
                onChange={(val) => handleChange("numberOfQuestions", val)}
                type="number"
                min="3"
                max="10"
                step="1"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Short (3)</span>
                <span>Standard (5)</span>
                <span>Extended (10)</span>
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
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <SpinnerLoaderLarge />
                  <span>Setting Up Your Interview...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Start Mock Interview</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Feedback</h3>
            <p className="text-sm text-gray-600">Get instant AI-powered evaluation of your answers with detailed suggestions</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Voice & Text Input</h3>
            <p className="text-sm text-gray-600">Answer questions using voice or text with real-time speech recognition</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
            <p className="text-sm text-gray-600">Track your improvement with detailed analytics and performance scores</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewForm;