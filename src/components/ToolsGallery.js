import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ToolsGallery = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  const tools = [
    {
      id: 'learning-assistant',
      title: 'AI Learning Assistant',
      description: 'Transform your study experience with AI-powered learning tools',
      icon: '🧠',
      color: 'violet',
      path: '/dashboard',
      status: 'active',
      plan: 'free',
      badge: 'Popular',
      features: {
        free: [
          'Smart Document Analysis',
          'Basic Flashcards',
          'Study Guides',
          'Limited Chat'
        ],
        pro: [
          'Advanced AI Analysis',
          'Interactive Study Tools',
          'Unlimited Features',
          'Priority Support',
          'Progress Tracking',
          'Custom Learning Paths'
        ]
      }
    },
    {
      id: 'exam-collaboration',
      title: 'Study Groups',
      description: 'Connect and collaborate with fellow students',
      icon: '🤝',
      color: 'green',
      path: '/exam-collab',
      status: 'active',
      plan: 'free',
      badge: 'New',
      features: {
        free: [
          'Join Study Groups',
          'Basic Chat',
          'Share Notes',
          'Public Forums'
        ],
        pro: [
          'Create Private Groups',
          'Video Meetings',
          'Advanced Collaboration',
          'Resource Library',
          'Real-time Updates',
          'Custom Study Plans'
        ]
      }
    },
    {
      id: 'lost-found',
      title: 'Lost & Found',
      description: 'AI-powered campus item tracking with secure claim system',
      icon: '🔍',
      color: 'amber',
      path: '/lost-found',
      status: 'active',
      plan: 'pro',
      badge: 'Reward System',
      features: {
        free: [
          'Basic Item Listing',
          'Simple Search',
          'Campus Map View',
          'Basic Notifications'
        ],
        pro: [
          'AI Image Recognition',
          'Smart Matching',
          'Secure Payment System',
          'Reward Distribution',
          'Identity Verification',
          'Claim Management'
        ]
      },
      rewardSystem: {
        verification: [
          'ID Verification Required',
          'Proof of Ownership Check',
          'Security Deposit'
        ],
        payment: [
          'Secure Payment Gateway',
          'Escrow Protection',
          'Automated Refunds'
        ],
        rewards: [
          'Finder Reward: 10-20%',
          'Platform Fee: 5%',
          'Quick Release System'
        ],
        process: [
          'Item Match Found',
          'Owner Verification',
          'Secure Payment',
          'Item Handover',
          'Reward Distribution'
        ]
      }
    },
    {
      id: 'code-assistant',
      title: 'Code Helper',
      description: 'Coming Soon - Advanced coding assistance powered by AI',
      icon: '🚀',
      color: 'blue',
      path: '/code',
      status: 'upcoming', // Changed from 'inactive' to 'upcoming'
      plan: 'pro',
      badge: 'Coming Soon',
      releaseDate: 'March 2024',
      features: {
        planned: [
          'AI Code Analysis',
          'Real-time Debugging',
          'Code Optimization',
          'Learning Paths',
          'Multi-language Support',
          'Project Templates'
        ]
      }
    },
    {
      id: 'writing-assistant',
      title: 'Writing Assistant',
      description: 'AI writing enhancement',
      icon: '✍️',
      color: 'emerald',
      path: '/writing',
      status: 'coming-soon',
      plan: 'enterprise',
      features: {
        free: [
          'Basic Grammar Check',
          'Simple Style Tips',
          'Word Count Tools',
          'Basic Templates'
        ],
        pro: [
          'Advanced Grammar Analysis',
          'Style Enhancement',
          'Plagiarism Check',
          'Citation Assistant',
          'Custom Templates',
          'Research Integration'
        ]
      }
    },
    {
      id: 'research-assistant',
      title: 'Research Assistant',
      description: 'AI research helper',
      icon: '🔍',
      color: 'amber',
      path: '/research',
      status: 'coming-soon',
      plan: 'enterprise',
      features: {
        free: [
          'Basic Research Tools',
          'Simple Citations',
          'Paper Templates',
          'Search Assistant'
        ],
        pro: [
          'Advanced Research Analysis',
          'Auto Citation Generator',
          'Paper Structure Assistant',
          'Source Verification',
          'Literature Review Helper',
          'Research Analytics'
        ]
      }
    }
  ];

  const handleToolClick = (tool) => {
    if (tool.status === 'active') {
      navigate(tool.path);
    }
  };

  const PlanBadge = ({ plan }) => {
    // Add default value and safeguard
    const planType = plan || 'free';
    
    const badges = {
      free: 'bg-green-500/20 text-green-400',
      pro: 'bg-violet-500/20 text-violet-400',
      enterprise: 'bg-blue-500/20 text-blue-400'
    };

    return (
      <span className={`absolute top-4 right-4 inline-flex items-center px-3 py-1 
                     rounded-full text-xs font-medium ${badges[planType]}`}>
        {planType.charAt(0).toUpperCase() + planType.slice(1)}
      </span>
    );
  };

  // Add Feature Modal Component
  const FeatureModal = ({ tool, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="glass-card p-6 rounded-xl max-w-4xl w-full mx-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{tool.icon}</span>
              {tool.title}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{tool.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Free Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">Free Plan</span>
            </div>
            <ul className="space-y-2">
              {tool.features.free.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-400">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 text-sm">Pro Plan</span>
            </div>
            <ul className="space-y-2">
              {tool.features.pro.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-400">
                  <svg className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Reward System Section for Lost & Found */}
          {tool.id === 'lost-found' && (
            <div className="col-span-2 mt-6">
              <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-amber-400 mb-4">Reward System</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Process Flow */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-amber-400">Claim Process</h5>
                    {tool.rewardSystem.process.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-400">{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Reward Details */}
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-amber-400 mb-2">Reward Distribution</h5>
                      {tool.rewardSystem.rewards.map((reward, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {reward}
                        </div>
                      ))}
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-amber-400 mb-2">Security Measures</h5>
                      {tool.rewardSystem.verification.map((measure, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          {measure}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            className="flex-1 py-2 px-4 rounded-lg bg-violet-500 text-white hover:bg-violet-600 transition-all duration-300"
            onClick={() => navigate(tool.path)}
            disabled={tool.status !== 'active'}
          >
            {tool.status === 'active' ? 'Try Now' : 'Coming Soon'}
          </button>
          <button
            className="flex-1 py-2 px-4 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Enhanced tool card component
  const ToolCard = ({ tool }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => tool.status === 'active' && handleToolClick(tool)}
      className={`relative p-6 rounded-2xl backdrop-blur-sm border 
        ${tool.status === 'active' 
          ? 'border-white/10 hover:border-white/20' 
          : 'border-dashed border-white/10'}
        bg-gradient-to-br from-gray-900/50 to-gray-800/50
        overflow-hidden transition-all duration-300
        ${tool.status === 'active' ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Tool Badge */}
      {tool.badge && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium
            ${tool.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
             tool.badge === 'New' ? 'bg-green-500/20 text-green-400' :
             'bg-violet-500/20 text-violet-400'}`}>
            {tool.badge}
          </span>
        </div>
      )}

      {/* Tool Content */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-start gap-4">
          <span className="text-3xl">{tool.icon}</span>
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">{tool.title}</h3>
            <p className="text-sm text-gray-400">{tool.description}</p>
          </div>
        </div>

        {/* Features Section */}
        {tool.status === 'upcoming' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Expected: {tool.releaseDate}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {tool.features.planned.slice(0, 4).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50"></span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {tool.features?.free?.slice(0, 2).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400/50"></span>
                {feature}
              </div>
            ))}
            {tool.features?.pro?.slice(0, 2).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400/50"></span>
                {feature}
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (tool.status === 'active') {
                setSelectedTool(tool);
                setShowFeatureModal(true);
              }
            }}
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
          >
            {tool.status === 'upcoming' ? 'View Roadmap' : 'See all features'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <PlanBadge plan={tool.plan} />
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        <div className="absolute right-0 bottom-0 text-[120px] leading-none opacity-10">{tool.icon}</div>
      </div>
    </motion.div>
  );

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
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400 
                           bg-clip-text text-transparent">
              AI Tools Suite
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover our collection of AI-powered tools designed to transform your learning experience
          </p>
        </div>

        {/* Tools Grid with Enhanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* Sticky Team Credits Footer */}
      <div class="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pb-4 pt-8">
        <div class="flex items-center justify-center gap-2">
          <span class="text-sm text-gray-400">Powered by</span>
          <span class="font-semibold bg-gradient-to-r from-violet-400 to-blue-400 
                       bg-clip-text text-transparent">Team TrishulX</span>
          <div class="animate-pulse">⚡</div>
        </div>
      </div>

      {/* Add padding to prevent content from being hidden behind sticky footer */}
      <div class="h-20"></div>

      {/* Add Feature Modal */}
      <AnimatePresence>
        {showFeatureModal && selectedTool && (
          <FeatureModal
            tool={selectedTool}
            onClose={() => {
              setSelectedTool(null);
              setShowFeatureModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolsGallery;
