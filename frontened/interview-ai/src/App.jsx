import React, { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Landingpage from "./pages/Interviewprep/Landingpage";
import Dashboard from "./pages/Home/Dashboard";
import Interviewpage from "./pages/Interviewprep/InterviewPrep";
import QuizPage from "./components/Quiz/QuizPage";
import { QuizComponent } from "./components/Quiz/QuizComponent";
import { QuizResults } from "./components/Quiz/QuizResults";
import QuizHistory from "./components/Quiz/QuizHistory";
import UserProvider, { UserContext } from "./context/Usercontext";
import { Navbar } from "./components/layouts/Navbar";

const AppContent = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div>
        {user && <Navbar />}
        <Routes>
          <Route path="/" element={<Landingpage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview-prep/:sessionId" element={<Interviewpage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/quiz/:quizId" element={<QuizComponent />} />
          <Route path="/quiz/results/:quizId" element={<QuizResults />} />
          <Route path="/quiz/history" element={<QuizHistory />} />
        </Routes>

        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;