import React from 'react';
import { QuizForm } from '../../components/Quiz/QuizForm';

const QuizPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <QuizForm />
        </div>
      </div>
    </div>
  );
};

export default QuizPage; // Default export for pages