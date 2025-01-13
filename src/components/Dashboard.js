import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import { processAnalysis, createQuiz, generateStudyGuide } from '../services/api';
import ChatDialog from './ChatDialog';
import FlashcardModal from './FlashcardModal';
import QuizModal from './QuizModal';
import StudyGuideModal from './StudyGuideModal';
import { motion, AnimatePresence } from 'framer-motion';
import KnowledgeGraphModal from './KnowledgeGraphModal';
import WelcomeUI from './WelcomeUI';

function Dashboard() {
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [studyGuideData, setStudyGuideData] = useState(null);
  const [isGeneratingStudyGuide, setIsGeneratingStudyGuide] = useState(false);
  const [isStudyGuideOpen, setIsStudyGuideOpen] = useState(false);
  const [knowledgeGraphData, setKnowledgeGraphData] = useState(null);
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [chatContext, setChatContext] = useState(null);
  const [chatMode, setChatMode] = useState('general');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [hasVisited, setHasVisited] = useState(() => {
    return localStorage.getItem('hasVisitedBefore') === 'true';
  });
  const [uploadStatus, setUploadStatus] = useState({
    isUploading: false,
    progress: 0,
    fileName: '',
    phase: '' // 'preparing', 'uploading', 'processing', 'complete', 'error'
  });
  const navigate = useNavigate();

  const handleFileProcessed = async (response, status) => {
    // Update upload status from FileUpload component
    setUploadStatus(status);
    
    try {
      const processed = await processAnalysis(response.analysis);
      setAnalysisData(processed);
      if (processed) {
        localStorage.setItem('analysisData', JSON.stringify(processed));
        setChatContext(processed);
        setChatMode('document');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature);
    if (feature === 'Flashcards') {
      setIsFlashcardsOpen(true);
    } else if (feature === 'Study Guide') {
      handleStudyGuideClick();
    }
  };

  const handleCreateQuiz = async () => {
    if (!analysisData) return;
    try {
      setIsGeneratingQuiz(true);
      const response = await createQuiz(analysisData);
      setQuizData(response);
      setIsQuizOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleStudyGuideClick = async () => {
    setSelectedFeature('Study Guide');
    if (!studyGuideData) {
      // Generate if not already generated
      try {
        setIsGeneratingStudyGuide(true);
        const response = await generateStudyGuide(analysisData);
        setStudyGuideData(response);
        setIsStudyGuideOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsGeneratingStudyGuide(false);
      }
    } else {
      // Just open modal if already generated
      setIsStudyGuideOpen(true);
    }
  };

  const handleKnowledgeGraphClick = async () => {
    if (!analysisData) return;
    try {
      setIsGeneratingGraph(true);
      const response = await fetch(`https://unilife-back-python.onrender.com/api/graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: analysisData })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate knowledge graph');
      }
      
      const data = await response.json();
      if (data.status === 'success' && data.graphData) {
        setKnowledgeGraphData(data.graphData);
        setIsKnowledgeGraphOpen(true);
      } else {
        console.error('Invalid graph data received');
      }
    } catch (err) {
      console.error('Error generating knowledge graph:', err);
    } finally {
      setIsGeneratingGraph(false);
    }
  };

  const handleBack = () => {
    // Add confirmation if there's unsaved work
    if (analysisData) {
      const confirmed = window.confirm('Are you sure you want to go back? Your current session will be lost.');
      if (!confirmed) return;
    }
    
    // Clear stored data before navigating
    localStorage.removeItem('analysisData');
    navigate('/', { replace: true });
  };

  const handleMobileFeatureClick = (feature) => {
    setActiveFeature(feature);
    handleFeatureClick(feature);
    setIsMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    setHasVisited(true);
    localStorage.setItem('hasVisitedBefore', 'true');
  };

  // Add mobile drawer component
  const MobileDrawer = () => (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-gray-900/95 backdrop-blur-lg z-50 
                 border-l border-white/10 shadow-2xl overflow-y-auto"
    >
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Features</h2>
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Enhanced Mobile Feature Grid */}
        <div className="grid grid-cols-2 gap-4">
          <MobileFeatureButton
            icon="📄"
            label="Upload Document"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('mobile-file-input')?.click();
            }}
            gradient="from-blue-500 to-violet-500"
          />
          <MobileFeatureButton
            icon="🎴"
            label="Flashcards"
            onClick={() => setIsFlashcardsOpen(true)}
            disabled={!analysisData}
            gradient="from-purple-500 to-pink-500"
          />
          <MobileFeatureButton
            icon="❓"
            label="Generate Quiz"
            onClick={handleCreateQuiz}
            disabled={!analysisData || isGeneratingQuiz}
            loading={isGeneratingQuiz}
            gradient="from-green-500 to-emerald-500"
          />
          <MobileFeatureButton
            icon="📚"
            label="Study Guide"
            onClick={handleStudyGuideClick}
            disabled={!analysisData || isGeneratingStudyGuide}
            loading={isGeneratingStudyGuide}
            gradient="from-orange-500 to-red-500"
          />
          <MobileFeatureButton
            icon="📊"
            label="Knowledge Graph"
            onClick={handleKnowledgeGraphClick}
            disabled={!analysisData || isGeneratingGraph}
            loading={isGeneratingGraph}
            gradient="from-pink-500 to-rose-500"
          />
          <MobileFeatureButton
            icon="💭"
            label="Chat Assistant"
            onClick={() => setIsMobileDrawerOpen(false)}
            gradient="from-teal-500 to-cyan-500"
          />
        </div>

        {/* Additional Info */}
        {!analysisData && (
          <div className="mt-6 p-4 rounded-lg bg-gray-800/50 border border-white/5">
            <p className="text-sm text-gray-400 text-center">
              Upload a document to unlock all features
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Add ProBadge component
  const ProBadge = () => (
    <div className="absolute -top-2 -right-2 z-10">
      <div className="relative">
        <div className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 
                      rounded-full text-white shadow-lg 
                      animate-pulse border border-amber-400/20">
          PRO
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 
                      rounded-full blur-lg opacity-40 animate-pulse"></div>
      </div>
    </div>
  );

  // Update MobileFeatureButton to include ProBadge
  const MobileFeatureButton = ({ icon, label, onClick, disabled, loading, gradient, isPro = true }) => (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.95 }}
      className={`relative flex flex-col items-center justify-center p-4 rounded-xl
                 overflow-hidden transition-all duration-300
                 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-black/20'}
                 ${loading ? 'animate-pulse' : ''}`}
    >
      {isPro && <ProBadge />}
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
      
      {/* Glass Effect */}
      <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 space-y-2">
        <span className="text-2xl block mb-1">
          {loading ? '⌛' : icon}
        </span>
        <span className="text-sm font-medium text-gray-200 block">
          {loading ? 'Loading...' : label}
        </span>
      </div>

      {/* Active Indicator */}
      {!disabled && !loading && (
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400" />
      )}
    </motion.button>
  );

  // Update FeatureBar component to include ProBadge
  const FeatureBar = () => (
    <div className="md:hidden w-full bg-gray-900/95 border-b border-white/10 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-2 py-3">
        {/* Scrollable container with custom scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto 
                      scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent
                      pb-2 -mb-2">
          {/* Upload Button with special styling */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('mobile-file-input')?.click();
            }}
            className="relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl
                      bg-gradient-to-r from-violet-600/20 to-blue-600/20 
                      border border-white/10 hover:border-violet-500/50
                      transition-all duration-300"
          >
            <ProBadge />
            <span className="text-lg">📄</span>
            <span className="text-sm font-medium text-violet-200">Upload</span>
          </motion.button>

          {/* Feature Buttons with consistent styling */}
          {[
            { id: 'flashcards', icon: '🎴', label: 'Cards', action: () => setIsFlashcardsOpen(true) },
            { id: 'quiz', icon: '❓', label: 'Quiz', action: handleCreateQuiz, loading: isGeneratingQuiz },
            { id: 'guide', icon: '📚', label: 'Guide', action: handleStudyGuideClick, loading: isGeneratingStudyGuide },
            { id: 'graph', icon: '📊', label: 'Graph', action: handleKnowledgeGraphClick, loading: isGeneratingGraph }
          ].map((feature) => (
            <motion.button
              key={feature.id}
              whileTap={{ scale: 0.95 }}
              onClick={feature.action}
              disabled={!analysisData || feature.loading}
              className={`relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl
                        transition-all duration-300 relative group
                        ${!analysisData || feature.loading 
                          ? 'opacity-50 cursor-not-allowed bg-gray-800/50' 
                          : 'bg-gray-800/50 hover:bg-gray-700/50 hover:border-violet-500/30 active:bg-gray-700/70'}
                        border border-white/5`}
            >
              <ProBadge />
              {/* Icon and Label */}
              <span className="text-lg">{feature.loading ? '⌛' : feature.icon}</span>
              <span className="text-sm font-medium text-gray-200">
                {feature.loading ? 'Loading...' : feature.label}
              </span>
              
              {/* Active/Loading Indicator */}
              {(!feature.loading && analysisData) && (
                <div className="absolute inset-0 rounded-xl bg-violet-400/5 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-300"/>
              )}
              
              {/* Loading Animation */}
              {feature.loading && (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent
                                -translate-x-full animate-shimmer"/>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );

  // Add this to your existing animations or create new ones
  const shimmerAnimation = {
    '.animate-shimmer': {
      animation: 'shimmer 2s infinite',
    },
    '@keyframes shimmer': {
      '0%': {
        transform: 'translateX(-100%)',
      },
      '100%': {
        transform: 'translateX(100%)',
      },
    },
  };

  const UploadStatus = () => {
    if (!uploadStatus.isUploading) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute left-1/2 -translate-x-1/2 top-20 z-50 w-[90%] max-w-md"
      >
        <div className="bg-gray-900/95 border border-white/10 rounded-xl p-4 backdrop-blur-md shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-200">
                {uploadStatus.phase === 'preparing' && '📋 Preparing...'}
                {uploadStatus.phase === 'uploading' && '📤 Uploading...'}
                {uploadStatus.phase === 'processing' && '⚡ Processing...'}
                {uploadStatus.phase === 'complete' && '✅ Complete!'}
                {uploadStatus.phase === 'error' && '❌ Error'}
              </span>
              <span className="text-sm text-gray-400">
                {uploadStatus.progress > 0 && `${Math.round(uploadStatus.progress)}%`}
              </span>
            </div>
            
            <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  uploadStatus.phase === 'error' ? 'bg-red-500' :
                  uploadStatus.phase === 'complete' ? 'bg-green-500' :
                  'bg-violet-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${uploadStatus.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 truncate max-w-[80%]">
                {uploadStatus.fileName}
              </p>
              <AnimatePresence mode="wait">
                {uploadStatus.phase === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs text-green-400">Ready!</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Update sidebar feature buttons to include ProBadge
  const SidebarFeatureButton = ({ icon, title, onClick, disabled, loading }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="relative w-full p-2 rounded-lg flex items-center gap-2 transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed
                 hover:bg-gray-800/50 text-gray-300"
    >
      <ProBadge />
      <span>{icon}</span>
      <span className="text-sm">{title}</span>
    </button>
  );

  return (
    <div className="min-h-screen w-full bg-gray-900 relative overflow-hidden">
      {/* Add UploadStatus at the top level */}
      <AnimatePresence>
        {uploadStatus.isUploading && <UploadStatus />}
      </AnimatePresence>

      {/* Add Welcome UI */}
      <AnimatePresence>
        {!hasVisited && <WelcomeUI onGetStarted={handleGetStarted} />}
      </AnimatePresence>

      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-violet-600/10 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[150px] animate-pulse delay-700"></div>
        {/* Enhanced floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-violet-400/20 rounded-full animate-float-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${20 + Math.random() * 15}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-[100rem] mx-auto h-screen flex flex-col relative z-10">
        {/* Simplified Header - Only Back Button */}
        <header className="flex justify-start items-center p-4 glass-card backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg 
                      bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300
                      text-gray-400 hover:text-white active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
        </header>

        {/* Rest of the components remain unchanged */}
        <FeatureBar />

        {/* Main Content Area - Modified for full screen */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 h-[calc(100vh-144px)]">
          {/* Collapsible Sidebar - Add scroll-hover class */}
          <div className="hidden md:flex md:w-80 flex-col gap-4 transition-all duration-300 overflow-y-auto scroll-hover">
            {/* Mobile Toggle Button */}
            <button className="md:hidden glass-card p-2 rounded-lg text-gray-400 hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            {/* Sidebar Content */}
            <div className="flex flex-col gap-4 md:flex">
              {/* File Upload */}
              <div className="glass-card p-3 md:p-4 rounded-xl">
                <h2 className="text-sm font-medium text-gray-400 mb-3">Upload Document</h2>
                <FileUpload onFileProcessed={handleFileProcessed} onStatusChange={setUploadStatus} />
              </div>

              {/* Feature Pills */}
              <div className="glass-card p-3 md:p-4 rounded-xl">
                <h2 className="text-sm font-medium text-gray-400 mb-3">Features</h2>
                <div className="space-y-2">
                  {[
                    { title: "Flashcards", icon: "🎴" }
                  ].map((feature, i) => (
                    <SidebarFeatureButton
                      key={i}
                      icon={feature.icon}
                      title={feature.title}
                      onClick={() => analysisData && handleFeatureClick(feature.title)}
                      disabled={!analysisData}
                    />
                  ))}
                  <button
                    onClick={handleCreateQuiz}
                    disabled={!analysisData || isGeneratingQuiz}
                    className={`w-full p-2 rounded-lg flex items-center gap-2 transition-colors
                      ${!analysisData || isGeneratingQuiz ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800/50'} 
                      ${selectedFeature === 'Quiz' ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'}`}
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <span className="animate-spin">⚡</span>
                        <span className="text-sm">Generating Quiz...</span>
                      </>
                    ) : (
                      <>
                        <span>📝</span>
                        <span className="text-sm">Create Quiz</span>
                      </>
                    )}
                  </button>
                  {/* Single Study Guide Button */}
                  <button
                    onClick={handleStudyGuideClick}
                    disabled={!analysisData || isGeneratingStudyGuide}
                    className={`w-full p-2 rounded-lg flex items-center gap-2 transition-colors
                      ${!analysisData || isGeneratingStudyGuide ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800/50'} 
                      ${selectedFeature === 'Study Guide' ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'}`}
                  >
                    {isGeneratingStudyGuide ? (
                      <>
                        <span className="animate-spin">📚</span>
                        <span className="text-sm">Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>📚</span>
                        <span className="text-sm">
                          {studyGuideData ? 'View Study Guide' : 'Generate Study Guide'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Add new Knowledge Graph button */}
                  <button
                    onClick={handleKnowledgeGraphClick}
                    disabled={!analysisData || isGeneratingGraph}
                    className={`w-full p-2 rounded-lg flex items-center gap-2 transition-colors
                      ${!analysisData || isGeneratingGraph ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800/50'}
                      ${selectedFeature === 'Knowledge Graph' ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'}`}
                  >
                    {isGeneratingGraph ? (
                      <>
                        <span className="animate-spin">📊</span>
                        <span className="text-sm">Generating Graph...</span>
                      </>
                    ) : (
                      <>
                        <span>📊</span>
                        <span className="text-sm">Knowledge Graph</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Main Chat Area */}
          <div className="flex-1 glass-card rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-white/20">
            <div className="h-full flex flex-col">
              <ChatDialog
                initialContext={chatContext}
                mode={chatMode}
                onModeChange={(mode) => setChatMode(mode)}
                className="h-full"
                key={chatContext ? 'document' : 'general'} // Force remount when context changes
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-0 z-50 md:hidden"
          >
            <div className="glass-card rounded-t-xl p-4 shadow-lg border-t border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-200">Features</h3>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-800/50 rounded-lg"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'upload', icon: '📄', label: 'Upload' },
                  { id: 'flashcards', icon: '🎴', label: 'Cards' },
                  { id: 'quiz', icon: '❓', label: 'Quiz' },
                  { id: 'guide', icon: '📚', label: 'Guide' },
                  { id: 'graph', icon: '📊', label: 'Graph' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMobileFeatureClick(item.id)}
                    className="flex flex-col items-center p-4 rounded-lg bg-gray-800/50
                             hover:bg-violet-500/10 transition-all duration-300"
                    disabled={!analysisData && item.id !== 'upload'}
                  >
                    <span className="text-2xl mb-2">{item.icon}</span>
                    <span className="text-sm text-gray-400">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Mobile-Friendly Modals */}
      <AnimatePresence>
        <FlashcardModal
          isOpen={isFlashcardsOpen}
          onClose={() => setIsFlashcardsOpen(false)}
          notes={analysisData?.studyGuide + "\n" + analysisData?.summary}
          className="mx-4 md:mx-0 max-w-[95vw] md:max-w-2xl"
        />
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          quiz={quizData}
          className="mx-4 md:mx-0"
        />
        <StudyGuideModal
          isOpen={isStudyGuideOpen}
          onClose={() => setIsStudyGuideOpen(false)}
          studyGuide={studyGuideData}
          className="mx-4 md:mx-0"
        />
        <KnowledgeGraphModal
          isOpen={isKnowledgeGraphOpen}
          onClose={() => setIsKnowledgeGraphOpen(false)}
          graphData={knowledgeGraphData}
        />
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;