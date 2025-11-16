import React from 'react'
import ProfileInfoCard from '../Cards/ProfileInfoCard'
import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <div className='h-16 bg-white border border-gray-200/50 backdrop-blur-[2px] py-2.5 px-4 md:px-0 sticky top-0 z-30'>
         <div className='container mx-auto flex items-center justify-between gap-5'>
            <Link to="/dashboard" className='text-2xl font-bold text-black'>
              <h2 className='text-lg md:text-xl font-meadium text-black leading-5'>Interview Prep AI</h2>
            </Link>
           
            <div className="flex items-center space-x-6">
              <Link 
                to="/quiz" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Quiz
              </Link>
              <Link 
                to="/quiz/history" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Results
              </Link>
              <ProfileInfoCard/>
            </div>
         </div>
    </div>
  )
}