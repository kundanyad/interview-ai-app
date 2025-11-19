const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register", // Signup
        LOGIN: "/api/auth/login", // Authenticate user & return JWT token
        GET_PROFILE: "/api/auth/profile", // Get logged-in user details
    },
    AI: {
        GENERATE_QUESTIONS: "/api/ai/generate-questions", // Generate interview questions and answers using Gemini
        GENERATE_EXPLANATION: "/api/ai/generate-explanation", // Generate concept explanation using Gemini
    },
    SESSION: {
        CREATE: "/api/sessions/create", // Create a new interview session with questions
        GET_ALL: "/api/sessions/my-sessions", // Get all user sessions
        GET_ONE: (id) => `/api/sessions/${id}`, // Get session details with questions
        DELETE: (id) => `/api/sessions/${id}`, // Delete a session
    },
    QUESTION: {
    ADD_TO_SESSION: "/api/question/add",
    PIN: (id) => `/api/question/${id}/pin`,
    UPDATE_NOTE: (id) => `/api/question/${id}/note`,
    },
    QUIZ: {
    GENERATE: "/api/quiz/generate",
    GET_ALL: "/api/quiz/my-quizzes",
    GET_ONE: (id) => `/api/quiz/${id}`,
    SUBMIT: "/api/quiz/submit",
    RESULTS: "/api/quiz/results"
  },    
       MOCK_INTERVIEW: {
        GENERATE: "/api/mock-interview/generate",
        SUBMIT_ANSWER: "/api/mock-interview/submit-answer",
        GET_RESULTS: (sessionId) => `/api/mock-interview/results/${sessionId}`,
        GET_USER_INTERVIEWS: "/api/mock-interview/my-interviews"
    }

};

export { BASE_URL };