import React from "react";
import { motion } from "framer-motion";

const SkeletonLoader = ({ cards = 5 }) => {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      
      {/* Header placeholder */}
      <div className="w-full max-w-6xl mb-10 space-y-2">
        <div className="w-1/3 h-8 bg-gray-300 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-full animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"></div>
        </div>
        <div className="w-2/3 h-6 bg-gray-200 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
        </div>
      </div>

      {/* Cards */}
      <div className="w-full max-w-6xl space-y-6">
        {Array.from({ length: cards }).map((_, idx) => (
          <motion.div
            key={idx}
            className="bg-white rounded-xl shadow-md p-6 space-y-3 relative overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <div className="w-3/4 h-5 bg-gray-300 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-full animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"></div>
            </div>
            <div className="w-1/2 h-4 bg-gray-200 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-3 bg-gray-100 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-full animate-shimmer bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100"></div>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-full animate-shimmer bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100"></div>
              </div>
              <div className="w-5/6 h-3 bg-gray-100 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-full animate-shimmer bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
