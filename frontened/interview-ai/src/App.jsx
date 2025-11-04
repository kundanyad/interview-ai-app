import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Landingpage from "./pages/Interviewprep/Landingpage";
import Dashboard from "./pages/Home/Dashboard";
import Interviewpage from "./pages/Interviewprep/InterviewPrep";
import UserProvider from "./context/Usercontext";

const App = () => {
  return (
    <UserProvider>
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landingpage />} ></Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview-prep/:sessionId" element={<Interviewpage />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </div>
    </UserProvider>
  );
};

export default App;
