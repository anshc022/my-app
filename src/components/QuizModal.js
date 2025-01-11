import React, { useState, useEffect } from 'react';

const QuizModal = ({ isOpen, onClose, quiz }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsAnimatingOut(false);
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(onClose, 200); // Match animation duration
  };

  if (!isOpen && !isAnimatingOut) return null;

  const parseQuizData = (quizText) => {
    if (!quizText) return [];
    
    // Remove any introductory text before the first question
    const cleanedText = quizText.substring(quizText.indexOf('Q1.'));
    
    return cleanedText.split(/Q\d+\./).filter(Boolean).map(question => {
      const lines = question.trim().split('\n').filter(Boolean);
      return {
        question: lines[0].trim(),
        options: lines.slice(1).filter(line => /^[a-d]\)/.test(line.trim())),
        answer: lines.find(line => line.includes('Answer:'))?.split('Answer:')[1]?.trim() || ''
      };
    });
  };

  const questions = parseQuizData(quiz?.quiz);

  const handleAnswer = () => {
    if (!selectedAnswer) return;

    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.answer;
    
    setUserAnswers(prev => [...prev, { 
      question: currentQ.question,
      userAnswer: selectedAnswer,
      correctAnswer: currentQ.answer,
      isCorrect
    }]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer('');
      setShowAnswer(false);
    } else {
      setCompleted(true);
    }
  };

  const renderQuestion = () => {
    if (!questions.length || currentQuestion >= questions.length) return null;
    
    const currentQ = questions[currentQuestion];

    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
          <div 
            className="bg-violet-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">
            Question {currentQuestion + 1}
            <span className="text-gray-400 text-lg ml-2">of {questions.length}</span>
          </h3>
          <div className="px-4 py-2 bg-violet-500/20 rounded-lg">
            <span className="text-violet-400 font-semibold">{score} points</span>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 shadow-lg">
          <p className="text-lg font-medium text-white mb-6">{currentQ.question}</p>
          <div className="grid gap-4">
            {currentQ.options.map((option, i) => {
              const optionLetter = option.trim().charAt(0);
              const optionContent = option.trim().slice(2);
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedAnswer(optionLetter)}
                  className={`
                    w-full p-4 rounded-xl text-left transition-all duration-200
                    flex items-center gap-3 group relative overflow-hidden
                    ${selectedAnswer === optionLetter
                      ? 'bg-violet-500/30 border-violet-500 text-white'
                      : 'bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    } border ${selectedAnswer === optionLetter ? 'border-violet-500' : 'border-gray-700'}
                  `}
                >
                  <span className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm
                    ${selectedAnswer === optionLetter
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-700 group-hover:bg-gray-600'
                    }
                  `}>
                    {optionLetter}
                  </span>
                  <span className="flex-1">{optionContent}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const percentage = Math.round((score / questions.length) * 100);
    const topicsToReview = userAnswers.filter(answer => !answer.isCorrect);

    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500">
            <div className="bg-gray-900 rounded-full p-4">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                {percentage}%
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mt-4 mb-2">
            {percentage === 100 ? 'Perfect Score! 🎉' : 
             percentage >= 80 ? 'Great Job! 🌟' : 
             percentage >= 60 ? 'Good Effort! 👍' : 
             'Keep Practicing! 💪'}
          </h3>
          <p className="text-gray-400">You scored {score} out of {questions.length} questions</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-white">Review:</h4>
          {userAnswers.map((answer, idx) => (
            <div key={idx} className={`p-4 rounded-lg ${
              answer.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <p className="font-medium text-white">{answer.question}</p>
              <p className={answer.isCorrect ? 'text-green-400' : 'text-red-400'}>
                Your answer: {answer.userAnswer}
              </p>
              {!answer.isCorrect && (
                <p className="text-green-400">
                  Correct answer: {answer.correctAnswer}
                </p>
              )}
            </div>
          ))}
        </div>
        {topicsToReview.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-white">Topics to Review:</h4>
            <ul className="list-disc list-inside text-gray-400">
              {topicsToReview.map((topic, idx) => (
                <li key={idx}>{topic.question}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={() => {
            setCurrentQuestion(0);
            setScore(0);
            setCompleted(false);
            setUserAnswers([]);
            setSelectedAnswer('');
          }}
          className="w-full p-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isAnimatingOut ? 'animate-out' : 'overlay-enter'}`}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className={`bg-gray-900 border border-gray-800/50 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col relative z-10 ${isAnimatingOut ? 'modal-exit' : 'modal-enter'}`}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Practice Quiz</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
          {completed ? renderSummary() : renderQuestion()}
        </div>

        {!completed && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleAnswer}
              disabled={!selectedAnswer}
              className="w-full p-3 bg-violet-600 text-white rounded-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-violet-700 transition-colors"
            >
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
