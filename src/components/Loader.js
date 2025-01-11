
import React from 'react';

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-50">
      <div className="relative">
        {/* Animated circles */}
        <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
          <div className="w-24 h-24 rounded-full border-2 border-violet-500/20 border-t-violet-500"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center animate-spin-slow-reverse">
          <div className="w-16 h-16 rounded-full border-2 border-blue-500/20 border-t-blue-500"></div>
        </div>
        
        {/* Center logo pulse */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 bg-violet-500/20 rounded-full animate-ping"></div>
          <div className="relative text-2xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            UL
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="absolute mt-32 text-center">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
          UniLife
        </h3>
        <p className="text-gray-400 text-sm mt-2">Loading your study assistant...</p>
      </div>
    </div>
  );
}

export default Loader;