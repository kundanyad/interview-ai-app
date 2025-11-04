import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { SpinnerLoaderLarge } from '../../components/Loaders/SpinnerLoader';
import { LuCircleAlert, LuListCollapse } from "react-icons/lu";
import { toast } from "react-hot-toast";
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { RoleInfoHeader } from './RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { QuestionCard } from '../../components/Cards/QuestionCard';
import { AIResponsePreview } from './AIResponsePreview';
import { Drawer } from '../../components/Loaders/Drawer';
import SkeletonLoader from '../../components/Loaders/SkeletonLoader';

function InterviewPrep() {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [openLearMoreDrawer, setOpenMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);

  // Fetch session details
  const fetchSessionDetailById = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
      if (response.data && response.data.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  // Generate AI explanation for a question
  const generateConceptExplanation = async (question) => {
    setErrorMsg("");
    setExplanation(null);
    setIsLoading(true);
    setOpenMoreDrawer(true);

    try {
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question }
      );

      if (response.data?.data) {
        setExplanation(response.data.data);
      }
    } catch (error) {
      setExplanation(null);
      if (error.response?.status === 503) {
        setErrorMsg("The AI model is busy. Please try again later.");
      } else {
        setErrorMsg("Failed to generate explanation. Try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle question pin
  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId));
      if (response.data?.question) {
        fetchSessionDetailById();
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  // Add more questions
  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10
        }
      );

      const generatedQuestions = aiResponse.data; // expect array of questions
      if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        setErrorMsg("AI did not return any questions.");
        return;
      }

      const response = await axiosInstance.post(API_PATHS.QUESTION.ADD_TO_SESSION, {
        sessionId,
        questions: generatedQuestions, // backend expects 'questions' array
      });

      if (response.data) {
        toast.success("Added More Q&A!");
        fetchSessionDetailById();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) fetchSessionDetailById();
  }, [sessionId]);

  return (
    <DashboardLayout>
      <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || "_"}
        question={sessionData?.question?.length || ""}
        description={sessionData?.description || ""}
        lastUpdated={
          sessionData?.updatedAt
            ? moment(sessionData.updatedAt).format("Do MMM YYYY")
            : ""
        }
      />

      <div className='container mx-auto pt-4 pb-4 md:px-0'>
        <h2 className='text-lg font-semibold color-black'>Interview Q & A</h2>

        <div className='grid grid-cols-12 gap-4 mt-5 mb-4'>
          <div className={`col-span-2 ${openLearMoreDrawer ? "md:col-span-7" : "md:col-span-8"}`}>
            <AnimatePresence>
              {sessionData?.question?.map((data, index) => (
                <motion.div
                  key={data._id || index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    type: "spring",
                    stiffness: 100,
                    delay: index * 0.1,
                    damping: 15,
                  }}
                  layout
                  layoutId={`question-${data._id || index}`}
                >
                  <QuestionCard
                    question={data?.question}
                    answer={data?.answer}
                    onLearnMore={() => generateConceptExplanation(data.question)}
                    isPinned={data?.isPinned}
                    onTogglePin={() => toggleQuestionPinStatus(data._id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load More Button */}
            <div className='flex items-center justify-center mt-5'>
              <button
                className='flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 rounded cursor-pointer'
                disabled={isLoading || isUpdateLoader}
                onClick={uploadMoreQuestions}
              >
                {isUpdateLoader ? <SpinnerLoaderLarge /> : <LuListCollapse className='text-lg' />}
                Load More
              </button>
            </div>
          </div>
        </div>

        {/* AI Explanation Drawer */}
        <Drawer
          isOpen={openLearMoreDrawer}
          onClose={() => setOpenMoreDrawer(false)}
          title={!isLoading && explanation?.title}
        >
          {errorMsg && (
            <p className='flex gap-2 text-sm text-amber-600 font-medium'>
              <LuCircleAlert className='' /> {errorMsg}
            </p>
          )}
          {isLoading && <SkeletonLoader />}
          {!isLoading && explanation && <AIResponsePreview content={explanation?.explanation} />}
        </Drawer>
      </div>
    </DashboardLayout>
  );
}

export default InterviewPrep;
