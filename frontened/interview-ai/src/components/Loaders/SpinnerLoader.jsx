import React from 'react'
import PropTypes from 'prop-types';


const SpinnerLoaderLarge = ({ text = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center w-full py-2">
        <div className="relative">
            <div className="w-4 h-4 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-2 h-2 text-blue-400 opacity-70" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>
        </div>
        <span className="mt-1 text-blue-500 text-xs font-medium animate-pulse">{text}</span>
    </div>
);

SpinnerLoaderLarge.propTypes = {
    text: PropTypes.string,
};

export { SpinnerLoaderLarge };