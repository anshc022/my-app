import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';

function Landing() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-8">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-indigo-600/20 blur-[90px] animate-pulse delay-500"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-violet-400/30 rounded-full
                       animate-float-slow transform`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${8 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="max-w-4xl mx-auto text-center z-10 space-y-8 px-4">
        <div className="flex flex-col items-center space-y-12">
          <div className="relative transform scale-[2] mt-20"> {/* Added mt-20 for top margin */}
            <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
              <div className="w-24 h-24 rounded-full border-2 border-violet-500/20 border-t-violet-500"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center animate-spin-slow-reverse">
              <div className="w-16 h-16 rounded-full border-2 border-blue-500/20 border-t-blue-500"></div>
            </div>
            
            {/* Center logo pulse - exactly matching Loader.js */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 bg-violet-500/20 rounded-full animate-ping"></div>
              <div className="relative text-2xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                UL
              </div>
            </div>
          </div>
          <p className="text-2xl text-gray-400 font-light mb-8"> {/* Added mb-8 for bottom margin */}
            Your AI Study Companion
          </p>
        </div>
        
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Transform your university experience with AI-powered study tools.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/tools')} // Changed from '/dashboard' to '/tools'
            className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl 
                     text-white font-semibold text-lg transition-all duration-300
                     shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40
                     hover:scale-105"
          >
            Get Started
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>

      {/* Website Features Section - Add after hero section and before other features */}
      <div className="w-full max-w-7xl mx-auto mt-16 md:mt-32 mb-16 md:mb-24 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              title: "Modern Interface",
              desc: "Clean and intuitive design for better learning experience"
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              ),
              title: "Cross Platform",
              desc: "Access your study materials from any device"
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: "Instant Access",
              desc: "No downloads required, start learning immediately"
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ),
              title: "Regular Updates",
              desc: "Continuous improvements and new features"
            }
          ].map((feature, i) => (
            <div key={i} className="glass-card p-6 rounded-xl group hover:transform hover:scale-105 transition-all duration-300">
              <div className="rounded-lg p-3 bg-gradient-to-r from-violet-500/10 to-blue-500/10 mb-4 w-fit">
                <div className="text-violet-400 group-hover:text-blue-400 transition-colors">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400">
                {feature.desc}
              </p>
              <div className="mt-4 h-1 w-12 bg-gradient-to-r from-violet-500/50 to-blue-500/50 rounded-full 
                            group-hover:w-full transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {/* Tech Stack Banner */}
        <div className="mt-8 md:mt-16 glass-card p-4 rounded-2xl overflow-x-auto">
          <div className="flex items-center justify-start md:justify-center gap-4 md:gap-8 flex-nowrap min-w-max px-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-sm text-gray-400">Enterprise Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                <path d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"/>
              </svg>
              <span className="text-sm text-gray-400">Real-time Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span className="text-sm text-gray-400">Advanced AI Models</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Feature Showcase */}
      <div className="max-w-6xl mx-auto mt-16 md:mt-24 space-y-16 md:space-y-32 px-4">
        {/* Feature Block 1 */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block px-4 py-2 bg-violet-500/10 rounded-full">
              <span className="text-violet-400 text-sm font-medium">Smart Analysis</span>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              AI-Powered Document Understanding
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Upload any document and let our AI break it down into digestible insights. 
              Get smart summaries and key concepts instantly.
            </p>
            <div className="flex gap-4 mt-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-400">PDF Support</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-400">Quick Analysis</span>
              </div>
            </div>
          </div>
          <div className="flex-1 glass-card p-8 rounded-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-blue-600/20 opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 
                           flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-violet-500/20 rounded w-3/4 animate-pulse"></div>
                <div className="h-2 bg-blue-500/20 rounded w-1/2 animate-pulse delay-100"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Block 2 */}
        <div className="flex flex-col-reverse md:flex-row-reverse items-center gap-8 md:gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block px-4 py-2 bg-blue-500/10 rounded-full">
              <span className="text-blue-400 text-sm font-medium">Study Tools</span>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Interactive Learning Materials
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Generate flashcards, quizzes, and study guides automatically. 
              Test your knowledge and track your progress.
            </p>
            <div className="flex gap-4 mt-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-400">Flashcards</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-400">Auto-quizzes</span>
              </div>
            </div>
          </div>
          <div className="flex-1 glass-card p-8 rounded-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-violet-600/20 opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 
                           flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-blue-500/20 rounded w-2/3 animate-pulse"></div>
                <div className="h-2 bg-violet-500/20 rounded w-1/2 animate-pulse delay-100"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Block 3 */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block px-4 py-2 bg-violet-500/10 rounded-full">
              <span className="text-violet-400 text-sm font-medium">AI Chat</span>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              24/7 Learning Assistant
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Get instant answers to your questions and explore topics deeper with our AI chat assistant.
            </p>
            <div className="flex gap-4 mt-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-400">Real-time Help</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-400">Smart Explanations</span>
              </div>
            </div>
          </div>
          <div className="flex-1 glass-card p-8 rounded-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-blue-600/20 opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 
                           flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-violet-500/20 rounded w-4/5 animate-pulse"></div>
                <div className="h-2 bg-blue-500/20 rounded w-3/5 animate-pulse delay-100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Why Choose Section */}
      <div className="max-w-6xl mx-auto mt-16 md:mt-32 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent mb-8 md:mb-16">
          Why Students Choose Our Platform
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {[
            {
              icon: (
                <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: "Lightning Fast",
              desc: "Get instant summaries and study materials in seconds, not hours",
              color: "violet"
            },
            {
              icon: (
                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              title: "AI Powered",
              desc: "Advanced AI technology that understands and explains complex topics",
              color: "blue"
            },
            {
              icon: (
                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              ),
              title: "Personalized",
              desc: "Adaptive learning that matches your pace and style",
              color: "indigo"
            },
            {
              icon: (
                <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              title: "Secure & Private",
              desc: "Your data and study materials are encrypted and protected",
              color: "violet"
            },
            {
              icon: (
                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "Track Progress",
              desc: "Monitor your learning journey with detailed analytics",
              color: "blue"
            },
            {
              icon: (
                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ),
              title: "Always Learning",
              desc: "Continuous updates with the latest learning techniques",
              color: "indigo"
            }
          ].map((item, i) => (
            <div key={i} 
                 className="glass-card p-6 rounded-xl relative group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-${item.color}-600/10 to-${item.color}-600/5 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}
              />
              <div className="relative z-10">
                <div className="mb-4 rounded-lg p-3 bg-gradient-to-r from-gray-900/50 to-gray-800/50 inline-block">
                  {item.icon}
                </div>
                <h3 className={`text-xl font-semibold text-${item.color}-400 mb-2`}>
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add a subtle separator */}
        <div className="my-20 w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

        {/* Enhanced Stats Section with Icons */}
        <div className="mt-12 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { 
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />,
              number: "95%", 
              label: "Student Satisfaction" 
            },
            { 
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
              number: "50K+", 
              label: "Documents Analyzed" 
            },
            { 
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
              number: "24/7", 
              label: "AI Availability" 
            },
            { 
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />,
              number: "10x", 
              label: "Faster Learning" 
            }
          ].map((stat, i) => (
            <div key={i} className="text-center glass-card p-6 rounded-xl group hover:transform hover:scale-105 transition-all duration-300">
              <svg className="w-8 h-8 text-violet-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {stat.icon}
              </svg>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-sm text-gray-400 mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 md:mt-16 flex flex-wrap justify-center gap-4 md:gap-8 items-center px-4">
        <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm text-gray-400">Secure & Encrypted</span>
        </div>
        <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
          <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm text-gray-400">Real-time Updates</span>
        </div>
        <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-gray-400">24/7 Support</span>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"/>

      {/* Gemini Badge */}
      <div className="fixed bottom-4 right-4 z-20">
        <div className="flex items-center space-x-2 glass-card px-4 py-2 rounded-full border border-white/10 
                      hover:border-violet-500/50 transition-all duration-300 group">
          <span className="text-sm text-gray-400">Powered by</span>
          <span className="font-semibold bg-gradient-to-r from-blue-400 to-violet-400 
                         bg-clip-text text-transparent group-hover:scale-105 transition-transform">
            Gemini
          </span>
          <svg className="w-4 h-4 text-violet-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 4.5l7.5 13.5h-15L12 6.5z"/>
          </svg>
        </div>
      </div>

      {/* Add this new sticky container for Team Credits & Powered By Section */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pb-4 pt-8">
        <div className="container mx-auto px-4">
          {/* Team Credits */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm text-gray-400">Made with</span>
            <div className="animate-pulse">❤️</div>
            <span className="text-sm text-gray-400">by</span>
            <span className="font-semibold bg-gradient-to-r from-violet-400 to-blue-400 
                         bg-clip-text text-transparent">Team TrishulX</span>
          </div>

          {/* Powered By Section */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 
                          border border-white/10 hover:border-violet-500/50 transition-all duration-300">
              <img src="https://www.gstatic.com/lamda/images/gemini_wordmark_dark_0824FA6E7F.svg" 
                   alt="Gemini" className="h-4" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            </div>
            
            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 
                          border border-white/10 hover:border-blue-500/50 transition-all duration-300">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" 
                   alt="React" className="h-4" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
            </div>
            
            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 
                          border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" 
                   alt="Tailwind" className="h-4" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Add padding to prevent content from being hidden behind sticky footer */}
      <div className="h-40"></div>

      {/* Team Credits & Powered By Section */}
      <div className="mt-16 mb-8 text-center space-y-4">
        {/* Team Credits */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-400">Made with</span>
          <div className="animate-pulse">❤️</div>
          <span className="text-sm text-gray-400">by</span>
          <span className="font-semibold bg-gradient-to-r from-violet-400 to-blue-400 
                       bg-clip-text text-transparent">Team TrishulX</span>
        </div>

        {/* Powered By Section */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 
                        border border-white/10 hover:border-violet-500/50 transition-all duration-300">
            <img src="https://camo.githubusercontent.com/77ba4ba362fc39151379e4e7691125c8bb130eb2ade811ce9f76d4d5236c6847/68747470733a2f2f75706c6f61642e77696b696d656469612e6f72672f77696b6970656469612f636f6d6d6f6e732f7468756d622f662f66302f476f6f676c655f426172645f6c6f676f2e7376672f3132303070782d476f6f676c655f426172645f6c6f676f2e7376672e706e67" 
                 alt="Gemini" className="h-4" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
          </div>
          
          <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 
                        border border-white/10 hover:border-blue-500/50 transition-all duration-300">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" 
                 alt="React" className="h-4" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
          </div>
          
          <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 
                        border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" 
                 alt="Tailwind" className="h-4" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;