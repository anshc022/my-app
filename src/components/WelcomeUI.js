import React from 'react';
import { motion } from 'framer-motion';

function WelcomeUI({ onGetStarted }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-lg w-full space-y-8 p-6 rounded-2xl bg-gray-800/50 border border-white/10"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center">
              <span className="text-4xl">📚</span>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-400">
            Welcome to Learning Hub
          </h1>
          
          <p className="text-gray-300">
            Your personal learning assistant that helps you understand and master any topic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "📄", title: "Upload Documents", desc: "Analyze any PDF document" },
            { icon: "🎴", title: "Flashcards", desc: "Create study materials" },
            { icon: "📝", title: "Smart Quiz", desc: "Test your knowledge" },
            { icon: "📊", title: "Visual Learning", desc: "See connections" }
          ].map((feature) => (
            <div key={feature.title} className="p-4 rounded-xl bg-gray-800/30 border border-white/5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-200">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onGetStarted}
          className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-blue-600 
                     text-white rounded-xl font-medium
                     hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                     transition-all duration-200"
        >
          Get Started
        </button>

        <p className="text-center text-sm text-gray-400">
          Upload your first document to begin learning
        </p>
      </motion.div>
    </motion.div>
  );
}

export default WelcomeUI;
