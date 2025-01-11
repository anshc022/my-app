import React, { useState, useRef, useEffect } from 'react';
import { sendQuery } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion'; // Add this import
import { v4 as uuidv4 } from 'uuid';

function ChatDialog({ initialContext, mode, onModeChange, className }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [suggestions, setSuggestions] = useState([
    "What can you help me learn?",
    "How do you assist with studying?",
    "Can you explain complex topics?",
    "What learning methods do you suggest?"
  ]);
  const [isDocMode, setIsDocMode] = useState(false);
  const [generalChat, setGeneralChat] = useState([{
    role: 'assistant',
    model: 'gemini-2.0-flash-exp',
    content: 'Hello! I\'m your learning assistant. How can I help you today?'
  }]);
  const [documentChat, setDocumentChat] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [currentModel, setCurrentModel] = useState('gemini-1.5-flash');
  const [sessionId] = useState(uuidv4());
  const [errorMessage, setErrorMessage] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [contextMemory, setContextMemory] = useState([]);

  const generalSuggestions = [
    "How can I improve my study habits?",
    "What are effective learning techniques?",
    "How to stay motivated while studying?",
    "Tips for better concentration"
  ];

  const documentSuggestions = [
    "Can you explain the key concepts?",
    "Summarize this in simpler terms",
    "How does this relate to other topics?",
    "Create practice questions about this"
  ];

  useEffect(() => {
    setSuggestions(isDocMode ? documentSuggestions : generalSuggestions);
  }, [isDocMode, documentSuggestions, generalSuggestions]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      chatContainer.scrollTo({
        top: messagesEndRef.current.offsetTop,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      if (initialContext && isDocMode) {
        return;
      }
      setMessages([{
        role: 'assistant',
        model: 'gemini-1.5-flash',
        content: 'Hello! I\'m your learning assistant. How can I help you today?'
      }]);
    }
  }, [messages.length, initialContext, isDocMode]);

  useEffect(() => {
    if (initialContext) {
      setIsDocMode(true);
    }
  }, [initialContext]);

  useEffect(() => {
    if (initialContext) {
      setSuggestions([
        "Can you summarize the main points?",
        "What are the key concepts I should understand?",
        "Can you explain this in simpler terms?",
        "How can I apply this knowledge?"
      ]);
    }
  }, [initialContext]);

  useEffect(() => {
    if (initialContext && isDocMode) {
      const analysisMessage = {
        role: 'assistant',
        model: 'gemini-2.0-flash-thinking',
        content: `Here's my analysis of your document:\n\n
**Summary**\n${initialContext.summary}\n\n
**Key Points**\n${initialContext.studyGuide}\n\n
What would you like to know more about?`
      };
      setMessages([
        { 
          role: 'assistant',
          model: 'gemini-2.0-flash-thinking',
          content: 'Switching to Document Analysis Mode.'
        },
        analysisMessage
      ]);
      setDocumentChat([
        { 
          role: 'assistant',
          model: 'gemini-2.0-flash-thinking',
          content: 'Switching to Document Analysis Mode.'
        },
        analysisMessage
      ]);
    }
  }, [initialContext, isDocMode]);

  useEffect(() => {
    if (initialContext && messages.length === 1) {
      const showInitialAnalysis = async () => {
        const message = `I've analyzed your document. Here's a summary:\n\n${initialContext.summary}\n\nWhat would you like to know about it?`;
        
        setIsTyping(true);
        let current = '';
        const words = message.split(' ');
        
        for (let word of words) {
          current += word + ' ';
          setCurrentMessage(current);
          await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 10));
        }

        setIsTyping(false);
        setCurrentMessage('');
        setMessages(prev => [...prev, { role: 'assistant', content: message }]);
      };

      showInitialAnalysis();
    }
  }, [initialContext, messages.length]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(`chat_history_${sessionId}`);
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, [sessionId]);

  useEffect(() => {
    if (mode) {
      setIsDocMode(mode === 'document');
    }
  }, [mode]);

  const toggleChatMode = () => {
    const newMode = !isDocMode;
    onModeChange?.(newMode ? 'document' : 'general');
    
    const currentConversation = [...messages];
    if (isDocMode) {
      setDocumentChat(currentConversation);
    } else {
      setGeneralChat(currentConversation);
    }

    setIsDocMode(newMode);
    if (newMode && initialContext) {
      if (documentChat.length > 0) {
        setMessages(documentChat);
      } else {
        // Reset and show initial analysis
        const analysisMessage = {
          role: 'assistant',
          model: 'gemini-2.0-flash-thinking',
          content: formatInitialAnalysis(initialContext)
        };
        const newMessages = [
          { 
            role: 'assistant',
            model: 'gemini-2.0-flash-thinking',
            content: 'Switching to Document Analysis Mode.'
          },
          analysisMessage
        ];
        setMessages(newMessages);
        setDocumentChat(newMessages);
      }
    } else {
      if (generalChat.length > 0) {
        setMessages(generalChat);
      } else {
        resetGeneralChat();
      }
    }
  };

  const formatInitialAnalysis = (context) => {
    return `Here's my analysis of your document:\n\n
**Summary**\n${context.summary}\n\n
**Key Points**\n${context.studyGuide}\n\n
What would you like to know more about?`;
  };

  const resetGeneralChat = () => {
    const newMessages = [{
      role: 'assistant',
      model: 'gemini-1.5-flash',
      content: 'Hello! I\'m your learning assistant. How can I help you today?'
    }];
    setMessages(newMessages);
    setGeneralChat(newMessages);
  };

  useEffect(() => {
    if (initialContext && !messages.length) {
      const analysisMessage = {
        role: 'assistant',
        model: 'gemini-2.0-flash-thinking',
        content: formatInitialAnalysis(initialContext)
      };
      setMessages([
        { 
          role: 'assistant',
          model: 'gemini-2.0-flash-thinking',
          content: 'Initializing Document Analysis Mode.'
        },
        analysisMessage
      ]);
    }
  }, [initialContext]);

  const handleSubmit = async (e, directMessage = null) => {
    e.preventDefault();
    const messageToSend = directMessage || input;
    if (!messageToSend.trim() || isLoading || isSending) return;

    // Reset states
    setErrorMessage(null);
    setIsThinking(true);
    setIsTyping(false);
    setIsSending(true);

    const userMessage = { role: 'user', content: messageToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await sendQuery(messageToSend, isDocMode, {
        sessionId,
        context: contextMemory
      });

      if (response.status === 'success') {
        const newMessage = {
          role: 'assistant',
          content: response.response,
          model: response.model_used,
          timestamp: new Date(),
          isNew: true
        };

        setMessages(prev => [...prev, newMessage]);
        setCurrentModel(response.model_used);
        setContextMemory(prev => [...prev, userMessage, newMessage].slice(-10));
        
        const updatedHistory = [...chatHistory, userMessage, newMessage];
        setChatHistory(updatedHistory);
        localStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(updatedHistory));
      } else {
        setErrorMessage('Failed to get a valid response. Please try again.');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setErrorMessage('Something went wrong. Please try again.');
      // Remove the auto-retry logic since it's causing issues
    } finally {
      setIsSending(false);
      setIsResponding(false);
      setIsThinking(false);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!isTyping) {
      setInput(suggestion);
      handleSubmit({ preventDefault: () => {}, target: null }, suggestion);
    }
  };

  const formatMessage = (content) => {
    return (
      <ReactMarkdown
        className="prose prose-invert max-w-none"
        components={{
          p: ({ children }) => <p className="mb-2">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => <code className="bg-gray-800 px-1 rounded">{children}</code>,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const getThemeColors = () => ({
    background: isDocMode ? 'bg-gray-900/50' : 'bg-indigo-900/30',
    header: isDocMode ? 'border-gray-800' : 'border-indigo-800',
    input: isDocMode ? 'bg-gray-900/50' : 'bg-gray-900/50',
    button: isDocMode ? 'bg-violet-600' : 'bg-blue-600',
    messageUser: isDocMode ? 'bg-violet-600/20' : 'bg-blue-600/20',
    messageBot: isDocMode ? 'bg-gray-800/80' : 'bg-gray-800/50',
    accent: isDocMode ? 'violet' : 'blue',
  });

  useEffect(() => {
    if (initialContext && documentChat.length === 0) {
      const analysisMessage = {
        role: 'assistant',
        content: `Here's my analysis of your document:\n\n
**Summary**\n${initialContext.summary}\n\n
**Key Points**\n${initialContext.studyGuide}\n\n
What would you like to know more about?`
      };
      setDocumentChat([
        { role: 'assistant', content: 'Welcome to Document Analysis Mode.' },
        analysisMessage
      ]);
    }
  }, [initialContext, documentChat.length]);

  const getInputPlaceholder = () => {
    if (isTyping) return "Please wait...";
    return isDocMode 
      ? "Ask about the document content..."
      : "Ask about learning techniques, study tips, or any topic...";
  };

  const theme = getThemeColors();

  const getMessageStyle = (msg) => {
    const theme = getThemeColors();
    const baseStyle = 'prose-invert'; 
    if (msg.role === 'user') {
      return `${baseStyle} bg-${theme.accent}-500/20 border border-${theme.accent}-500/30`;
    }
    return `${baseStyle} bg-gray-800/80 border border-gray-700/30`;
  };

  const MessageIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] p-4 rounded-xl bg-gray-800/80 border border-gray-700/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <span className="text-sm text-gray-400">Processing your request...</span>
        </div>
      </div>
    </motion.div>
  );

  const ModelBadge = ({ model }) => {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-violet-500/20 text-violet-300">
        <span className="mr-1">🤖</span>
        AI Assistant
      </div>
    );
  };

  const ErrorMessage = ({ message }) => (
    <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg 
                    backdrop-blur-sm transition-all duration-300 animate-fade-in">
      <p className="text-red-400 text-sm flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {message}
      </p>
    </div>
  );

  const ThinkingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] p-4 rounded-xl bg-gray-800/80 border border-gray-700/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="animate-pulse">🤔</div>
          <span className="text-violet-300 text-sm">Thinking deeply about your question...</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden"> {/* Add overflow-hidden here */}
      <div className={`p-4 border-b ${theme.header} backdrop-blur-md sticky top-0 z-10`}>
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex bg-gray-900/70 p-1 rounded-lg shadow-inner relative">
            <div
              className={`absolute inset-y-1 transition-all duration-200 rounded-md bg-gradient-to-r from-violet-500 to-blue-500
                ${isDocMode ? 'translate-x-full w-[50%]' : 'translate-x-0 w-[50%]'}`}
            />
            <button
              onClick={toggleChatMode}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 z-10
                ${!isDocMode ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
            >
              <span className={`text-lg ${!isDocMode ? 'animate-scale-in' : ''}`}>🤖</span>
              <span className={`text-sm font-medium ${!isDocMode ? 'animate-slide-fade' : ''}`}>
                AI Chat
              </span>
            </button>
            <button
              onClick={toggleChatMode}
              disabled={!initialContext}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 z-10
                ${isDocMode ? 'text-white' : 'text-gray-400 hover:text-gray-300'}
                ${!initialContext && 'opacity-50 cursor-not-allowed'}`}
            >
              <span className={`text-lg ${isDocMode ? 'animate-scale-in' : ''}`}>📄</span>
              <span className={`text-sm font-medium ${isDocMode ? 'animate-slide-fade' : ''}`}>
                Document
              </span>
            </button>
          </div>
          {initialContext && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 animate-slide-fade
                          border border-green-500/20 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75"></div>
              </div>
              <span className="text-xs text-green-400 font-medium">Analysis Ready</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Modify the chat container div */}
      <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth relative">
        {errorMessage && <ErrorMessage message={errorMessage} />}
        <div className="max-w-screen-xl mx-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div 
                className={`max-w-[85%] p-4 rounded-xl text-base shadow-xl 
                  backdrop-blur-sm transition-all duration-300
                  ${getMessageStyle(msg)} ${msg.isNew ? 'animate-message-appear' : ''}`}
              >
                {msg.role === 'assistant' && msg.model && (
                  <div className="mb-2 ModelBadge">
                    <ModelBadge model={msg.model} />
                  </div>
                )}
                <div 
                  className="message-content select-text" 
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap select-text">{msg.content}</div>
                  ) : (
                    formatMessage(msg.content)
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 max-w-4xl mx-auto"
            >
              <p className="text-sm text-gray-400/80 font-medium">
                {isDocMode ? "Questions about your document:" : "Popular topics:"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isTyping}
                    className="p-4 text-sm text-left text-gray-200 bg-gray-800/30
                      rounded-lg disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          <AnimatePresence>
            {(isSending || isTyping) && <MessageIndicator />}
            {isThinking && <ThinkingIndicator />}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-px" /> {/* Add height to ensure proper scroll */}
        </div>
      </div>

      <form 
        onSubmit={(e) => handleSubmit(e, input)} 
        className={`p-4 border-t ${theme.header} backdrop-blur-md sticky bottom-0 z-10`}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ModelBadge model={currentModel} />
              <span className="text-xs text-gray-400">
                {(currentModel || '').includes('2.0') ? 
                  'Using advanced model for complex queries' : 
                  'Using standard model for general queries'}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`w-full text-white rounded-xl px-6 py-4 
                  focus:outline-none focus:ring-2 focus:ring-${theme.accent}-500/50
                  ${theme.input} border border-gray-700/30 backdrop-blur-md
                  transition-all duration-300`}
                placeholder={getInputPlaceholder()}
                disabled={isSending}
              />
              {isSending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className={`w-5 h-5 rounded-full border-2 border-t-transparent animate-spin ${
                    isDocMode ? 'border-violet-500' : 'border-blue-500'
                  }`}></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className={`px-6 py-4 bg-gradient-to-r 
                ${isDocMode ? 'from-violet-600 to-violet-500' : 'from-blue-600 to-blue-500'}
                text-white rounded-xl disabled:opacity-50 min-w-[60px]
                flex items-center justify-center transition-all duration-300
                hover:shadow-lg hover:scale-105 active:scale-95`}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <svg 
                  className="w-5 h-5 transform rotate-90" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 19l9-7-9-7v14zm0 0l-9-7 9-7v14z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ChatDialog;