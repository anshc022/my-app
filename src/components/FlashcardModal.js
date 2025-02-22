import React, { useState, useEffect } from 'react';
import { generateFlashcards } from '../services/api';
import { motion } from 'framer-motion';

const FlashcardModal = ({ isOpen, onClose, notes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && notes) {
      loadFlashcards();
    }
    return () => {
      // Cleanup on unmount or close
      setCards([]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setError(null);
    };
  }, [isOpen, notes]);

  const loadFlashcards = async () => {
    if (!notes) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await generateFlashcards(notes);
      if (response.status === 'success' && response.flashcards) {
        const parsedCards = parseFlashcards(response.flashcards);
        if (parsedCards.length > 0) {
          setCards(parsedCards);
        } else {
          throw new Error('No valid flashcards generated');
        }
      } else {
        throw new Error('Failed to generate flashcards');
      }
    } catch (err) {
      setError('Unable to generate flashcards. Please try again.');
      console.error('Flashcard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const parseFlashcards = (text) => {
    try {
      const pairs = text.match(/Q\d+:\s*([^\n]+)\s*A\d+:\s*([^\n]+)/g) || [];
      return pairs.map(pair => {
        const [question, answer] = pair.split(/A\d+:/);
        return {
          question: question.replace(/Q\d+:/, '').trim(),
          answer: answer.trim()
        };
      }).filter(card => card.question && card.answer); // Only keep valid cards
    } catch (error) {
      console.error('Error parsing flashcards:', error);
      return [];
    }
  };

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
      // Reset states
      setCurrentIndex(0);
      setIsFlipped(false);
      setCards([]);
      setError(null);
    }, 300);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <motion.div 
        className="bg-gray-900 rounded-2xl w-full max-w-3xl shadow-2xl relative z-10"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="p-4 sm:p-6 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></span>
                <span className="hidden sm:inline">Generating Flashcards...</span>
                <span className="sm:hidden">Loading...</span>
              </span>
            ) : cards.length > 0 ? (
              <span className="flex items-center gap-2">
                <span className="text-violet-400">📝</span>
                {`${currentIndex + 1} / ${cards.length}`}
              </span>
            ) : 'Flashcards'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors active:scale-95"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-8">
          {isLoading ? (
            <div className="h-48 sm:h-64 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🎴</span>
                </div>
              </div>
              <p className="text-gray-400">Creating your flashcards...</p>
            </div>
          ) : error ? (
            <div className="h-48 sm:h-64 flex flex-col items-center justify-center space-y-4">
              <span className="text-4xl">⚠️</span>
              <p className="text-red-400 text-center">{error}</p>
              <button
                onClick={loadFlashcards}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : cards.length > 0 ? (
            <div
              className="relative h-48 sm:h-64 w-full transition-all duration-700 transform-gpu cursor-pointer perspective-1000 select-none"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className={`absolute inset-0 backface-hidden transition-all duration-700 transform-gpu rounded-xl p-4 sm:p-6 flex items-center justify-center text-center
                  ${isFlipped ? 'rotate-y-180 bg-violet-900/20' : 'bg-gradient-to-br from-gray-800 to-gray-900'}`}
              >
                <p className="text-lg sm:text-xl text-white leading-relaxed">{cards[currentIndex]?.question}</p>
              </div>
              <div
                className={`absolute inset-0 backface-hidden transition-all duration-700 transform-gpu rounded-xl p-4 sm:p-6 flex items-center justify-center text-center
                  bg-gradient-to-br from-indigo-900/20 to-violet-900/20
                  ${isFlipped ? 'rotate-y-0' : 'rotate-y-180'}`}
              >
                <p className="text-lg sm:text-xl text-white leading-relaxed">{cards[currentIndex]?.answer}</p>
              </div>
            </div>
          ) : (
            <div className="h-48 sm:h-64 flex items-center justify-center">
              <p className="text-gray-400">No flashcards available</p>
            </div>
          )}
        </div>

        {!isLoading && !error && cards.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-gray-800 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center">
            <button
              onClick={handlePrev}
              className="w-full sm:w-auto px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>←</span> Previous
            </button>
            <p className="text-gray-400 text-sm">Tap card to flip</p>
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Next <span>→</span>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FlashcardModal;