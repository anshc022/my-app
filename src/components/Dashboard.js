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
  const navigate = useNavigate();

  const handleFileProcessed = async (response) => {
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

  return (
    <div className="min-h-screen w-full bg-gray-900 relative overflow-hidden">
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
        {/* Enhanced Header with improved navigation */}
        <header className="flex justify-between items-center p-4 glass-card backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg 
                        bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300
                        text-gray-400 hover:text-white active:scale-95"
              aria-label="Go back"
            >
              <svg 
                className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="h-6 w-px bg-gray-700/50 hidden sm:block" />
            
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent 
                         bg-gradient-to-r from-violet-400 to-blue-400 flex items-center gap-2">
              <span className="hidden sm:inline">AI</span> Learning Assistant
              <div className="flex items-center gap-2 ml-2 px-2 py-0.5 rounded-full 
                            bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Live</span>
              </div>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <nav className="hidden md:flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white 
                               hover:bg-gray-800/50 rounded-lg transition-all duration-300">
                Dashboard
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white 
                               hover:bg-gray-800/50 rounded-lg transition-all duration-300">
                History
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white 
                               hover:bg-gray-800/50 rounded-lg transition-all duration-300">
                Settings
              </button>
            </nav>

            <div className="h-6 w-px bg-gray-700/50 hidden md:block" />

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full 
                          border border-white/10 bg-gray-900/50">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></div>
              <span className="text-xs text-gray-400 hidden sm:block">AI Ready</span>
            </div>
          </div>
        </header>

        {/* Main Content Area - Modified for full screen */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 h-[calc(100vh-80px)]">
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
                <FileUpload onFileProcessed={handleFileProcessed} />
              </div>

              {/* Feature Pills */}
              <div className="glass-card p-3 md:p-4 rounded-xl">
                <h2 className="text-sm font-medium text-gray-400 mb-3">Features</h2>
                <div className="space-y-2">
                  {[
                    { title: "Summaries", icon: "📝" },
                    { title: "Flashcards", icon: "🎴" }
                  ].map((feature, i) => (
                    <button
                      key={i}
                      onClick={() => analysisData && handleFeatureClick(feature.title)}
                      className={`w-full p-2 rounded-lg flex items-center gap-2 transition-colors
                        ${!analysisData ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800/50'} 
                        ${selectedFeature === feature.title ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'}`}
                      disabled={!analysisData}
                    >
                      <span>{feature.icon}</span>
                      <span className="text-sm">{feature.title}</span>
                    </button>
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
                  { id: 'summary', icon: '📝', label: 'Summary' },
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