import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { checkHealth } from './services/api';
import Dashboard from './components/Dashboard';
import Loader from './components/Loader';
import Landing from './components/Landing';
import ToolsGallery from './components/ToolsGallery';
import ExamCollaboration from './components/ExamCollaboration';  // Make sure this is the only import for ExamCollaboration
import LostAndFound from './components/LostAndFound/LostAndFound';
import { AuthProvider } from './context/AuthContext';
import CodeAssistant from './components/CodeAssistant/CodeAssistant';
import CodeLearning from './components/CodeAssistant/CodeLearning';

function App() {
  const [isFileProcessed, setIsFileProcessed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialAnalysis, setInitialAnalysis] = useState(null);

  useEffect(() => {
    // Check backend health and local storage
    const checkStatus = async () => {
      const savedAnalysis = localStorage.getItem('analysisData');
      if (savedAnalysis) {
        setInitialAnalysis(JSON.parse(savedAnalysis));
        setIsFileProcessed(true);
      }
      setIsLoading(false);
    };

    checkStatus();

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => console.log('ServiceWorker registered'))
          .catch(err => console.log('ServiceWorker registration failed'));
      });
    }
  }, []);

  const handleFileProcessed = async (analysisData) => {
    setIsLoading(true);
    try {
      if (analysisData.status === 'success') {
        setInitialAnalysis(analysisData.analysis);
        setIsFileProcessed(true);
      } else {
        throw new Error('File processing failed');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      // Add error handling UI if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsLoading(true);
    localStorage.removeItem('analysisData');
    setIsFileProcessed(false);
    setInitialAnalysis(null);
    setIsLoading(false);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen relative">
          {/* Fixed Background */}
          <div className="bg-gradient-wrapper" />
          
          {/* Background effects */}
          <div className="bg-effects">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/30 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/30 blur-[120px] animate-pulse delay-700"></div>
          </div>
          
          {isLoading && <Loader />}
          
          {/* Main Content */}
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/tools" element={<ToolsGallery />} />
            <Route path="/dashboard" element={<Dashboard onFileProcessed={handleFileProcessed} />} />
            <Route path="/exam-collab" element={<ExamCollaboration />} />
            <Route path="/lost-found" element={<LostAndFound />} />
            {/* Add these placeholder routes for future tools */}
            <Route path="/code" element={<CodeAssistant />} />
            <Route path="/code-learning" element={<CodeLearning />} />
            <Route path="/writing" element={<div>Coming Soon</div>} />
            <Route path="/research" element={<div>Coming Soon</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
