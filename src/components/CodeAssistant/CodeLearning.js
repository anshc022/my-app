import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Add new loading animation component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/20 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-400">Loading content...</p>
  </div>
);

// Update TheorySection with better styling
const TheorySection = ({ section }) => {
  if (!section || (!section.title && !section.content && !section.sections)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-white/5 hover:border-white/10 transition-all"
    >
      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        {section.title || "Core Programming Concepts"}
      </h3>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 mb-6 leading-relaxed">
          {section.content || "Understanding programming fundamentals"}
        </p>
        
        {Array.isArray(section.sections) && section.sections.map((subsection, idx) => (
          <div key={idx} className="mt-8 space-y-4 bg-gray-900/30 rounded-lg p-6">
            <h4 className="text-xl font-semibold text-white">
              {subsection.title || "Basic Concepts"}
            </h4>
            <p className="text-gray-300 leading-relaxed">
              {subsection.explanation || "Learning programming fundamentals"}
            </p>
            
            {Array.isArray(subsection.examples) && subsection.examples.length > 0 && (
              <div className="mt-6">
                <h5 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-3">
                  Examples
                </h5>
                <div className="space-y-3">
                  {subsection.examples.map((ex, i) => (
                    <div key={i} className="bg-gray-950/50 rounded-lg p-4 font-mono text-sm">
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {Array.isArray(subsection.keyPoints) && subsection.keyPoints.length > 0 && (
              <div className="mt-6">
                <h5 className="text-sm font-medium text-green-400 uppercase tracking-wider mb-3">
                  Key Points
                </h5>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subsection.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="text-green-400">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const ResourceLink = ({ resource }) => (
  <a
    href={resource?.url || '#'}
    target="_blank"
    rel="noopener noreferrer"
    className="block p-3 bg-gray-800/30 hover:bg-gray-700/30 rounded-lg transition-colors"
  >
    <div className="flex items-center gap-3">
      <span className="text-blue-400 font-medium">{resource?.title || 'Resource'}</span>
      <span className="text-xs px-2 py-1 bg-gray-700/50 rounded text-gray-400">
        {resource?.type || 'article'}
      </span>
    </div>
  </a>
);

// Update Quiz component with better styling
const Quiz = ({ concepts, onComplete, onRetry }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    generateQuestions();
  }, [concepts]);

  const generateQuestions = async () => {
    try {
      setLoading(true);
      // Build the data to send
      const requestData = {
        concepts,
        language: location.state?.language || 'javascript',
        goal: location.state?.goal || 'fundamentals',
        experience: location.state?.experience || 'beginner'
      };

      // Use the level endpoint instead since it already includes quiz content
      const response = await fetch(
        `http://localhost:5001/api/code-learning/quiz`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        throw new Error('No questions received');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      // Set fallback questions
      setQuestions([
        {
          question: "What is the primary purpose of programming?",
          options: [
            "To write code that solves problems",
            "To create efficient algorithms",
            "To build useful applications",
            "All of the above"
          ],
          correctIndex: 3,
          explanation: "Programming encompasses all these aspects"
        },
        {
          question: "Why do we use variables in programming?",
          options: [
            "To store data for later use",
            "To make code more readable",
            "To perform calculations",
            "All of the above"
          ],
          correctIndex: 3,
          explanation: "Variables serve multiple purposes in programming"
        },
        {
          question: "What is the importance of code organization?",
          options: [
            "Makes code easier to read",
            "Makes maintenance simpler",
            "Helps prevent bugs",
            "All of the above"
          ],
          correctIndex: 3,
          explanation: "Good code organization is crucial for successful programming"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selectedIndex) => {
    if (selectedIndex === questions[currentQuestion].correctIndex) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    onRetry(); // Add this to allow going back to content
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-400">Generating quiz questions...</p>
      </div>
    );
  }

  if (showResults) {
    const passed = score >= Math.ceil(questions.length * 0.7); // 70% passing score
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold mb-4">Quiz Results</h3>
        <p className="text-lg mb-4">
          You scored: {score} out of {questions.length}
        </p>
        {passed ? (
          <div>
            <p className="text-green-400 mb-4">Congratulations! You can move to the next level.</p>
            <button
              onClick={() => onComplete(true)}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg"
            >
              Next Level
            </button>
          </div>
        ) : (
          <div>
            <p className="text-red-400 mb-4">Please review the concepts and try again.</p>
            <div className="flex gap-4">
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
              >
                Review Content
              </button>
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setScore(0);
                  setShowResults(false);
                }}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg"
              >
                Retry Quiz
              </button>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/50 rounded-xl p-8 border border-white/5"
    >
      {/* ...existing Quiz render logic with updated styling... */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Knowledge Check
          </h3>
          <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>

        <p className="text-xl text-white">{questions[currentQuestion].question}</p>
        
        <div className="grid gap-4">
          {questions[currentQuestion].options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleAnswer(index)}
              className="p-4 text-left rounded-lg bg-gray-700/50 hover:bg-gray-600/50 
                       border border-white/5 hover:border-white/10 transition-all"
            >
              <span className="text-gray-300">{option}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Rename this component to TheoryContent to avoid duplicate declaration
const TheoryContent = ({ theory, onUnderstand }) => (
  <div className="space-y-6">
    {theory.map((section, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.1 }}
        className="p-6 rounded-xl bg-gray-800/50 border border-white/10"
      >
        <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
        <p className="text-gray-300 mb-4">{section.content}</p>
        
        {section.sections && section.sections.map((subsection, subIdx) => (
          <div key={subIdx} className="mt-4 space-y-3">
            <h4 className="text-lg font-medium text-white">{subsection.title}</h4>
            <p className="text-gray-300">{subsection.explanation}</p>
            
            {subsection.examples && subsection.examples.length > 0 && (
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-400 mb-2">Examples:</h5>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {subsection.examples.map((example, exIdx) => (
                    <li key={exIdx}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {subsection.keyPoints && subsection.keyPoints.length > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-400 mb-2">Key Points:</h5>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {subsection.keyPoints.map((point, pointIdx) => (
                    <li key={pointIdx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {idx === theory.length - 1 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUnderstand}
            className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 
                     text-white font-semibold hover:from-blue-600 hover:to-blue-700"
          >
            I Understand This Section
          </motion.button>
        )}
      </motion.div>
    ))}
  </div>
);

const CodeLearning = () => {
  const location = useLocation();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelData, setLevelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [error, setError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [theoryCompleted, setTheoryCompleted] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [contentCompleted, setContentCompleted] = useState(false);

  useEffect(() => {
    console.log('Location state:', location.state); // Debug log
    if (!location.state?.pathId) {
      setError('No learning path selected. Please go back and select a path.');
      return;
    }
    fetchLevelData();
  }, [currentLevel, location.state?.pathId]);

  // Update fetchLevelData function to handle response properly
  const fetchLevelData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!location.state?.pathId) {
        throw new Error('Missing path ID');
      }

      const queryParams = new URLSearchParams({
        language: location.state?.language || 'javascript',
        goal: location.state?.goal || 'fundamentals',
        experience: location.state?.experience || 'beginner',
        education: location.state?.education || 'self_learner'
      });

      console.log('Fetching level data with params:', queryParams.toString());

      const response = await fetch(
        `http://localhost:5001/api/code-learning/level/${location.state.pathId}/${currentLevel}?${queryParams}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch level data');
      }

      const data = await response.json();
      console.log('Received data:', data);

      if (!data.levelData) {
        throw new Error('No level data in response');
      }

      // Enhanced validation of theory data
      const validatedTheory = Array.isArray(data.levelData.theory) ? 
        data.levelData.theory.map(section => ({
          title: section.title || "Introduction",
          content: section.content || "Understanding programming concepts",
          sections: Array.isArray(section.sections) ? 
            section.sections.map(subsection => ({
              title: subsection.title || "Basic Concepts",
              explanation: subsection.explanation || "Learning fundamental concepts",
              examples: Array.isArray(subsection.examples) ? subsection.examples : ["Example code"],
              keyPoints: Array.isArray(subsection.keyPoints) ? subsection.keyPoints : ["Key learning point"]
            })) : []
        })) : [];

      const validatedData = {
        ...data.levelData,
        title: data.levelData.title || `Level ${currentLevel}`,
        description: data.levelData.description || "Learning programming concepts",
        theory: validatedTheory,
        concepts: Array.isArray(data.levelData.concepts) ? data.levelData.concepts : ["Programming Basics"]
      };

      console.log('Setting validated data:', validatedData);
      setLevelData(validatedData);
      setQuizStarted(false);
      setContentCompleted(false);

    } catch (error) {
      console.error('Error fetching level data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update the DebugInfo component
  const DebugInfo = ({ data }) => (
    process.env.NODE_ENV === 'development' ? (
      <>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="fixed bottom-4 right-4 z-50 p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
        >
          {showDebug ? 'Hide' : 'Show'} Debug
        </button>
        {showDebug && (
          <div className="fixed bottom-16 right-4 p-4 bg-gray-800 rounded-lg max-w-md overflow-auto max-h-60">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-mono">Debug Info:</h4>
              <button
                onClick={() => setShowDebug(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <pre className="text-xs text-gray-400">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </>
    ) : null
  );

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleQuizComplete = (passed) => {
    if (passed) {
      setCurrentLevel(prev => Math.min(prev + 1, 5));
      setQuizStarted(false);
    }
  };

  const handleTheoryComplete = () => {
    setTheoryCompleted(true);
    setContentCompleted(true);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  // Update renderTheorySection to handle the new structure
  const renderTheorySection = (section) => (
    <div key={section.title} className="bg-gray-800/50 rounded-xl p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 mb-6">{section.content}</p>
        
        {section.sections?.map((subsection, idx) => (
          <div key={idx} className="mt-8 space-y-4">
            <h4 className="text-lg font-medium text-white">{subsection.title}</h4>
            <p className="text-gray-300 mb-4">{subsection.explanation}</p>
            
            {subsection.examples?.length > 0 && (
              <div className="mt-4 bg-gray-900/50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-400 mb-3">Examples:</h5>
                <ul className="list-disc list-inside space-y-2">
                  {subsection.examples.map((ex, i) => (
                    <li key={i} className="text-gray-300 font-mono">{ex}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {subsection.keyPoints?.length > 0 && (
              <div className="mt-4 bg-gray-900/50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-green-400 mb-3">Key Points:</h5>
                <ul className="list-disc list-inside space-y-2">
                  {subsection.keyPoints.map((point, i) => (
                    <li key={i} className="text-gray-300">{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full bg-purple-600/10 blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Navigation header */}
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-white/5"
              >
                ← Back
              </button>
              <div className="text-sm text-gray-400">
                Level {currentLevel} / {5}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm">
                {location.state?.language}
              </span>
              <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm">
                {location.state?.goal}
              </span>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {error ? (
            <div className="bg-red-500/10 rounded-xl p-8 text-center border border-red-500/20">
              {/* ...existing error UI... */}
            </div>
          ) : loading ? (
            <LoadingSpinner />
          ) : levelData ? (
            <div className="space-y-8">
              {/* Level header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                  {levelData.title}
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  {levelData.description}
                </p>
              </div>

              {/* Content sections */}
              {!quizStarted ? (
                <div className="space-y-8">
                  {levelData.theory?.map((section, idx) => (
                    <TheorySection key={idx} section={section} />
                  ))}
                  {contentCompleted ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartQuiz}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 
                               text-white font-bold text-lg hover:from-blue-600 hover:to-purple-600
                               transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Take the Quiz
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleTheoryComplete}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 
                               text-white font-bold text-lg hover:from-green-600 hover:to-blue-600
                               transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      I Understand This Content
                    </motion.button>
                  )}
                </div>
              ) : (
                <Quiz 
                  concepts={levelData.concepts}
                  onComplete={handleQuizComplete}
                  onRetry={() => {
                    setQuizStarted(false);
                    setContentCompleted(false);
                  }}
                />
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default CodeLearning;
