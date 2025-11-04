import React from "react";

function Modal({ children, isOpen, onClose, title, hideHeader }) {
   
  if(!isOpen)
    return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/40"
    >
      <div className="relative flex flex-col bg-white shadow-lg rounded-lg overflow-hidden max-w-lg w-full">
        
       
        {!hideHeader && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="md:text-lg font-medium text-gray-900">{title}</h3>
          </div>
        )}

         
        <button
  type="button"
  className="text-gray-600 bg-transparent hover:bg-orange-100 hover:text-gray-900 rounded-lg w-8 h-8 flex justify-center items-center absolute top-3 right-3 cursor-pointer"
  onClick={onClose}
  aria-label="Close"
>
  <svg
    className="w-6 h-6"  
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
</button>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
