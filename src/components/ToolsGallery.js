import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ToolsGallery = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'learning-assistant',
      title: 'Learning Assistant',
      description: 'AI-powered study tool with flashcards, quizzes, and study guides',
      icon: '🎓',
      color: 'violet',
      path: '/dashboard',
      status: 'active'
    },
    {
      id: 'exam-collaboration',
      title: 'Exam Collaboration',
      description: 'Connect with peers for exam preparation and study groups',
      icon: '👥',
      color: 'green',
      path: '/exam-collab',
      status: 'active'
    },
    {
      id: 'lost-found',
      title: 'Lost & Found',
      description: 'Report and find lost items on campus with AI assistance',
      icon: '🔍',
      color: 'amber',
      path: '/lost-found',
      status: 'active'  
    },
    {
      id: 'code-assistant',
      title: 'Code Assistant',
      description: 'AI-powered programming learning path and code analyzer',
      icon: '💻',
      color: 'blue',
      path: '/code',
      status: 'active' // Changed from 'coming-soon' to 'active'
    },
    {
      id: 'writing-assistant',
      title: 'Writing Assistant',
      description: 'Coming soon - AI writing enhancement and analysis',
      icon: '✍️',
      color: 'emerald',
      path: '/writing',
      status: 'coming-soon'
    },
    {
      id: 'research-assistant',
      title: 'Research Assistant',
      description: 'Coming soon - AI-powered research and citation helper',
      icon: '🔍',
      color: 'amber',
      path: '/research',
      status: 'coming-soon'
    }
  ];

  const handleToolClick = (tool) => {
    if (tool.status === 'active') {
      navigate(tool.path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-violet-600/10 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[150px] animate-pulse delay-700"></div>
      </div>

      {/* Add Back Button */}
      <div className="fixed top-4 left-4 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 
                   hover:bg-gray-800/70 border border-white/10 transition-all duration-300"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm text-gray-400">Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            AI Tools Suite
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore our collection of AI-powered tools designed to enhance your learning and productivity
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleToolClick(tool)}
              className={`p-6 rounded-2xl backdrop-blur-sm border border-white/10
                bg-gradient-to-br relative overflow-hidden cursor-pointer
                ${tool.status === 'active' 
                  ? `from-${tool.color}-500/20 to-${tool.color}-500/5 hover:from-${tool.color}-500/30 hover:to-${tool.color}-500/10` 
                  : 'from-gray-800/50 to-gray-900/50'}`}
            >
              {/* Content */}
              <div className="relative z-10">
                <span className="text-4xl mb-4 block">{tool.icon}</span>
                <h3 className="text-xl font-semibold mb-2">{tool.title}</h3>
                <p className="text-gray-400 mb-4">{tool.description}</p>
                
                {/* Status Badge */}
                {tool.status === 'coming-soon' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400">
                    Coming Soon
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    Active
                  </span>
                )}
              </div>

              {/* Decorative Elements */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <span className="text-9xl">{tool.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sticky Team Credits Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pb-4 pt-8">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-400">Powered by</span>
          <span className="font-semibold bg-gradient-to-r from-violet-400 to-blue-400 
                       bg-clip-text text-transparent">Team TrishulX</span>
          <div className="animate-pulse">⚡</div>
        </div>
      </div>

      {/* Add padding to prevent content from being hidden behind sticky footer */}
      <div className="h-20"></div>
    </div>
  );
};

export default ToolsGallery;
