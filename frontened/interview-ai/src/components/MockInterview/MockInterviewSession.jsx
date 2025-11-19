import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { SpinnerLoaderLarge } from '../Loaders/SpinnerLoader';

const MockInterviewSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [interimText, setInterimText] = useState('');

  // Speech recognition refs from the working code
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const startLockRef = useRef(false);
  const lastResultTime = useRef(Date.now());
  const restartInterval = useRef(null);
  const stopTimerRef = useRef(null);

  const MINIMUM_LISTEN_TIME = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    fetchSession();
    
    return () => {
      cleanupSpeechResources();
    };
  }, [sessionId]);

  // ---------------- SPEECH RECOGNITION LOGIC FROM WORKING CODE ----------------
  const createRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSpeechError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return null;
    }

    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onresult = (event) => {
      lastResultTime.current = Date.now();
      let finalT = "", interimT = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalT += res[0].transcript;
        else interimT += res[0].transcript;
      }

      if (finalT.trim()) {
        setUserAnswer((prev) => (prev ? prev + " " + finalT.trim() : finalT.trim()));
      }

      setInterimText(interimT.trim());
    };

    recog.onerror = (err) => {
      console.log('Speech recognition error:', err.error);
      
      // if the user stopped listening we don't restart
      if (!shouldListenRef.current) return;
      
      // handle permission errors explicitly
      if (err && (err.error === "not-allowed" || err.error === "audio-capture")) {
        try {
          // ensure we really stop
          if (recognitionRef.current) {
            try { recognitionRef.current.onend = null; } catch {}
            try { recognitionRef.current.stop(); } catch {}
          }
        } catch {}
        setSpeechError("Microphone access is blocked. Please allow microphone permissions in your browser settings.");
        stopSpeechToText();
        return;
      }
      
      // For network errors, try safe restart
      if (err.error === 'network') {
        console.log('Network error, attempting safe restart...');
        safeRestart();
        return;
      }
      
      safeRestart();
    };

    recog.onend = () => {
      console.log('Speech recognition ended');
      // If user requested stop, don't restart
      if (!shouldListenRef.current) {
        setIsRecording(false);
        return;
      }
      safeRestart();
    };

    return recog;
  };

  // ------------- HARD, SAFE RESTART -------------
  const safeRestart = () => {
    if (!shouldListenRef.current) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.onend = null; } catch {}
        try { recognitionRef.current.stop(); } catch {}
      }
    } catch {}

    recognitionRef.current = null;

    setTimeout(() => {
      if (!shouldListenRef.current) return;
      recognitionRef.current = createRecognition();
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          console.log('Safe restart successful');
        }
      } catch (e) {
        console.log('Safe restart failed:', e);
        // swallow start errors, will be retried by watchdog
      }
    }, 200);
  };

  // -------------------- START SPEECH TO TEXT --------------------
  const startSpeechToText = () => {
    if (startLockRef.current) return;

    // Check browser support
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSpeechError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    shouldListenRef.current = true;
    startLockRef.current = true;

    // ensure a full reset before starting
    stopSpeechToText();

    setUserAnswer('');
    setInterimText('');
    setIsRecording(true);
    setSpeechError('');

    setTimeout(() => {
      recognitionRef.current = createRecognition();
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          console.log('Speech recognition started successfully');
        }
      } catch (e) {
        console.error('Error starting speech recognition:', e);
        // if start fails, release lock so user can try again
        startLockRef.current = false;
        setIsRecording(false);
        setSpeechError('Failed to start speech recognition. Please try again.');
      }
    }, 150);

    // watchdog to keep recognizer alive across silence
    restartInterval.current = setInterval(() => {
      if (!shouldListenRef.current) return;
      if (Date.now() - lastResultTime.current > 4000) safeRestart();
    }, 2000);

    // auto stop after minimum time
    stopTimerRef.current = setTimeout(() => {
      console.log('Auto-stopping after minimum listen time');
      stopSpeechToText();
    }, MINIMUM_LISTEN_TIME);
  };

  // -------------------- HARD STOP SPEECH TO TEXT --------------------
  const stopSpeechToText = () => {
    shouldListenRef.current = false;
    startLockRef.current = false;

    clearInterval(restartInterval.current);
    clearTimeout(stopTimerRef.current);

    setIsRecording(false);
    setInterimText(''); // Clear interim text when stopping

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.onend = null; } catch {}
        try { recognitionRef.current.stop(); } catch {}
      }
    } catch (e) {
      console.log('Error during stop:', e);
    }
    recognitionRef.current = null;
  };

  const cleanupSpeechResources = () => {
    stopSpeechToText();
    stopSpeaking();
  };

  const fetchSession = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.MOCK_INTERVIEW.GET_RESULTS(sessionId));
      if (response.data.success) {
        setSession(response.data.session);
        setCurrentQuestionIndex(response.data.session.currentQuestion || 0);
      } else {
        throw new Error('Failed to fetch session');
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setSpeechError('Failed to load interview session');
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-Speech for reading questions
  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setSpeechError('Failed to read question aloud');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      setSpeechError('Text-to-speech is not supported in your browser');
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      setSpeechError('Please provide an answer before submitting.');
      return;
    }

    // Stop any active recording or speech
    stopSpeechToText();
    stopSpeaking();

    setIsSubmitting(true);
    setSpeechError('');

    try {
      const response = await axiosInstance.post(API_PATHS.MOCK_INTERVIEW.SUBMIT_ANSWER, {
        sessionId,
        questionIndex: currentQuestionIndex,
        userAnswer: userAnswer.trim(),
        audioDuration: 0
      });

      if (response.data.success) {
        setEvaluation(response.data.evaluation);
        
        if (response.data.isCompleted) {
          setTimeout(() => {
            navigate(`/mock-interview/results/${sessionId}`);
          }, 3000);
        }
      } else {
        throw new Error(response.data.message || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setSpeechError(error.response?.data?.message || 'Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    setEvaluation(null);
    setUserAnswer('');
    setInterimText('');
    setCurrentQuestionIndex(prev => prev + 1);
    setSpeechError('');
    stopSpeaking();
    stopSpeechToText();
  };

  const clearSpeechError = () => {
    setSpeechError('');
  };

  const clearAnswer = () => {
    setUserAnswer('');
    setInterimText('');
    setSpeechError('');
    stopSpeechToText();
  };

  const useManualTyping = () => {
    setSpeechError('');
    stopSpeechToText();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="text-center">
          <SpinnerLoaderLarge />
          <p className="mt-4 text-gray-600">Loading your interview session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h2>
          <p className="text-gray-600 mb-6">The interview session you're looking for doesn't exist or you don't have access to it.</p>
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

  const currentQuestion = session.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Completed!</h2>
          <p className="text-gray-600 mb-6">You've successfully completed all {session.totalQuestions} questions.</p>
          <button 
            onClick={() => navigate(`/mock-interview/results/${sessionId}`)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            View Detailed Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Mock Interview</h1>
              <p className="text-gray-600 mt-1">{session.role} • {session.experience} years experience</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Question {currentQuestionIndex + 1} of {session.totalQuestions}
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestionIndex) / session.totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Question Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Current Question</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => speakQuestion(currentQuestion.question)}
                  disabled={isPlaying}
                  className={`p-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    isPlaying 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  } disabled:opacity-50`}
                >
                  {isPlaying ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                      Speaking...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414-1.414m-1.414-2.829a5 5 0 010 7.071m1.414-8.485a9 9 0 010 12.727" />
                      </svg>
                      Read Aloud
                    </>
                  )}
                </button>
                {isPlaying && (
                  <button
                    onClick={stopSpeaking}
                    className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Stop
                  </button>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${
                currentQuestion.type === 'technical' 
                  ? 'bg-blue-100 text-blue-800'
                  : currentQuestion.type === 'behavioral'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)}
              </span>
            </div>
            
            <p className="text-lg text-gray-800 mb-6 leading-relaxed bg-gray-50 p-4 rounded-lg border">
              {currentQuestion.question}
            </p>

            {currentQuestion.expectedTopics && currentQuestion.expectedTopics.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Expected Topics:</h3>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.expectedTopics.map((topic, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Answer Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Response</h2>
            
            {/* Voice Recording Controls */}
            <div className="mb-6">
              {/* Error Display */}
              {speechError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-red-700 flex-1">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <span className="font-medium">Voice Input Issue</span>
                        <p className="text-sm text-red-600 mt-1">{speechError}</p>
                      </div>
                    </div>
                    <button
                      onClick={clearSpeechError}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={useManualTyping}
                      className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700 transition-colors"
                    >
                      Type Instead
                    </button>
                    {(speechError.includes('network') || speechError.includes('Microphone')) && (
                      <button
                        onClick={startSpeechToText}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Retry Voice Input
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Voice Controls */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={toggleRecording}
                  className={`flex-1 py-4 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isRecording 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      Start Voice Input
                    </>
                  )}
                </button>

                <button
                  onClick={clearAnswer}
                  className="py-4 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-gray-600 text-white hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
              </div>
              
              {/* Recording Status */}
              {isRecording && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">
                      Listening... Speak now (Continuous mode)
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    Your speech is being converted to text in real-time. The system will automatically recover from network issues.
                  </p>
                  {interimText && (
                    <p className="text-sm text-green-700 mt-2 font-medium">
                      Current: {interimText}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer {isRecording && "(speaking...)"}
              </label>
              <textarea
                value={userAnswer + (interimText ? ` ${interimText}` : '')}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here or use voice input above..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {userAnswer.length} characters
                </span>
                {userAnswer.length > 0 && (
                  <span className="text-xs text-green-600">
                    ✓ Ready to submit
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={submitAnswer}
              disabled={isSubmitting || !userAnswer.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <SpinnerLoaderLarge />
                  <span>AI is Evaluating Your Answer...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Answer for AI Evaluation
                </>
              )}
            </button>

            {!userAnswer.trim() && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                Please provide an answer to get AI feedback
              </p>
            )}
          </div>
        </div>

        {/* Evaluation Display */}
        {evaluation && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">AI Feedback</h3>
            </div>
            
            {/* Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">{evaluation.score}/10</div>
                <div className="text-sm font-medium text-green-700">Overall Score</div>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">{evaluation.strengths?.length || 0}</div>
                <div className="text-sm font-medium text-blue-700">Strengths</div>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200">
                <div className="text-2xl font-bold text-orange-600 mb-1">{evaluation.improvements?.length || 0}</div>
                <div className="text-sm font-medium text-orange-700">Areas to Improve</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-lg font-bold text-purple-600 mb-1">
                  {evaluation.score >= 8 ? 'Excellent' : evaluation.score >= 6 ? 'Good' : evaluation.score >= 4 ? 'Fair' : 'Needs Work'}
                </div>
                <div className="text-sm font-medium text-purple-700">Performance</div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Feedback */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Detailed Feedback:</h4>
                <p className="text-gray-700 leading-relaxed text-base">{evaluation.feedback}</p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {evaluation.strengths?.map((strength, index) => (
                      <li key={index} className="text-green-700 flex items-start gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {evaluation.improvements?.map((improvement, index) => (
                      <li key={index} className="text-orange-700 flex items-start gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Answer */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Suggested Answer
                </h4>
                <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border">
                  {evaluation.suggestedAnswer}
                </p>
              </div>
            </div>

            {/* Next Question Button */}
            {currentQuestionIndex < session.totalQuestions - 1 && (
              <div className="mt-8 text-center">
                <button
                  onClick={nextQuestion}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] flex items-center gap-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Next Question
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Question {currentQuestionIndex + 2} of {session.totalQuestions}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviewSession;