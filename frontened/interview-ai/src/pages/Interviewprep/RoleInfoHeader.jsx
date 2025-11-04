import React from 'react'

export const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  question,
  description,
  lastUpdated,
}) => {
  return (
    <div className='bg-white relative overflow-hidden'>
      <div className='container mx-auto px-10 md:px-0'>
        <div className='h-[200px] flex flex-col justify-center relative z-10'>
          <div className='flex items-start'>
            <div className='flex-grow'>
              <div className='flex justify-between items-start'>
                <div>
                  <h2 className='text-2xl font-medium'>{role}</h2>
                  <p className='text-sm text-gray-900 mt-1'>{topicsToFocus}</p>
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-3 mt-4'>
            <div className='text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full'>
              Experience: {experience} {experience === 1 ? 'Year' : 'Years'}
            </div>

            <div className='text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full'>
              {question} Q&A
            </div>

            <div className='text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full'>
              Last Updated: {lastUpdated}
            </div>
          </div>
        </div>

        
        <div className='absolute top-0 right-0 w-[200px] h-full flex flex-col items-center justify-center pointer-events-none'>
          <div className='w-16 h-16 bg-lime-400 blur-[65px] rounded-full animate-blob1 absolute top-10 right-5'></div>
          <div className='w-16 h-16 bg-teal-400 blur-[65px] rounded-full animate-blob2 absolute top-20 right-10'></div>
          <div className='w-16 h-16 bg-cyan-300 blur-[45px] rounded-full animate-blob3 absolute top-32 right-20'></div>
          <div className='w-16 h-16 bg-fuchsia-200 blur-[45px] rounded-full animate-blob1 absolute top-40 right-0'></div>
        </div>
      </div>
    </div>
  )
}
