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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
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
          Revolutionizing campus life with AI-powered solutions for learning, community, and lost items
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

      {/* Main Content Sections - Reorganized */}
      <div className="w-full max-w-7xl mx-auto mt-16 space-y-32 px-6">
        {/* Campus Benefits Section - New */}
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            Transform Your Campus Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📚',
                title: 'Smarter Learning',
                points: [
                  'AI-powered document analysis saves hours of study time',
                  'Interactive flashcards and quizzes for better retention',
                  'Personalized study guides adapt to your learning style',
                  '24/7 AI chat support for instant help'
                ]
              },
              {
                icon: '🤝',
                title: 'Connected Community',
                points: [
                  'Find and connect with study groups easily',
                  'Share resources and knowledge securely',
                  'Collaborate in real-time on projects',
                  'Build a stronger campus network'
                ]
              },
              {
                icon: '🔄',
                title: 'Efficient Campus Life',
                points: [
                  'Quick lost item recovery with AI matching',
                  'Secure reward system for found items',
                  'Verified user system for safety',
                  'Real-time notifications and updates'
                ]
              }
            ].map((benefit) => (
              <div key={benefit.title} className="glass-card p-6 rounded-xl text-left">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{benefit.icon}</span>
                  <h3 className="text-xl font-semibold text-white">{benefit.title}</h3>
                </div>
                <ul className="space-y-3">
                  {benefit.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-400 text-sm">
                      <svg className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: '🔒',
              title: 'Smart Security',
              desc: 'Verified users and secure system'
            },
            {
              icon: '💰',
              title: 'Fair Rewards',
              desc: 'Transparent reward distribution'
            },
            {
              icon: '🤝',
              title: 'Community',
              desc: 'Active student engagement'
            },
            {
              icon: '🤖',
              title: 'AI Powered',
              desc: 'Smart AI assistance'
            }
          ].map((feature, i) => (
            <div key={i} className="glass-card p-6 rounded-xl group hover:scale-105 transition-all duration-300">
              <span className="text-3xl mb-4 block">{feature.icon}</span>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Tools Overview */}
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            Integrated Campus Solutions
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12">
            Everything you need for a smarter, more connected, and efficient campus experience - all in one place
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI Learning Assistant',
                icon: '🧠',
                desc: 'Transform your study experience with AI-powered learning tools',
                features: [
                  'Smart Document Analysis',
                  'Interactive Flashcards',
                  'Custom Study Guides',
                  'Real-time AI Chat Support',
                  'Knowledge Graphs'
                ],
                color: 'violet'
              },
              {
                title: 'Lost & Found System',
                icon: '🔍',
                desc: 'AI-powered item tracking with secure reward distribution',
                features: [
                  'Image Recognition',
                  'Smart Item Matching',
                  'Secure Payment System',
                  'Verified Claims Process',
                  'Instant Notifications'
                ],
                color: 'amber'
              },
              {
                title: 'Study Groups',
                icon: '👥',
                desc: 'Connect and collaborate with fellow students',
                features: [
                  'Real-time Collaboration',
                  'Resource Sharing',
                  'Group Discussion',
                  'Event Planning',
                  'Progress Tracking'
                ],
                color: 'green'
              }
            ].map((tool) => (
              <div key={tool.title} 
                   className="glass-card p-8 rounded-xl relative group hover:scale-105 transition-all duration-300 border border-white/10">
                {/* Tool Header */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl">{tool.icon}</span>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white">{tool.title}</h3>
                    <p className="text-sm text-gray-400">{tool.desc}</p>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 text-left">
                  {tool.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-400">
                      <svg className={`w-5 h-5 text-${tool.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Learn More Button */}
                <button 
                  onClick={() => navigate('/tools')}
                  className={`mt-6 w-full py-2 px-4 rounded-lg bg-${tool.color}-500/20 
                           text-${tool.color}-400 hover:bg-${tool.color}-500/30 
                           transition-all duration-300 text-sm font-medium`}
                >
                  Learn More →
                </button>

                {/* Background Decoration */}
                <div className="absolute bottom-0 right-0 opacity-5 text-8xl">
                  {tool.icon}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Replace Stats Section with Business Model Section */}
        <div className="space-y-12">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-violet-400 via-amber-400 to-green-400 bg-clip-text text-transparent mb-8">
            Choose Your Plan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Free Tier',
                price: '₹0',
                period: '/month',
                description: 'Perfect for getting started',
                features: [
                  'Basic AI Document Analysis',
                  'Simple Study Tools',
                  'Limited Lost & Found',
                  'Community Access',
                  'Basic Support'
                ],
                color: 'green',
                buttonText: 'Get Started'
              },
              {
                title: 'Pro',
                price: '₹99',
                period: '/month',
                description: 'For serious students',
                features: [
                  'Advanced AI Analysis',
                  'Unlimited Documents',
                  'Full Lost & Found Access',
                  'Priority Support',
                  'AI Chat Assistant',
                  'Premium Study Tools',
                  'Reward System Access'
                ],
                color: 'violet',
                badge: 'Most Popular',
                buttonText: 'Try Pro'
              },
              {
                title: 'Enterprise',
                price: 'Custom',
                description: 'For institutions',
                features: [
                  'Custom Integration',
                  'Dedicated Support',
                  'API Access',
                  'Analytics Dashboard',
                  'SLA Agreement',
                  'Custom Features',
                  'Volume Discount'
                ],
                color: 'blue',
                buttonText: 'Contact Sales'
              }
            ].map((plan, i) => (
              <div key={plan.title} 
                   className={`glass-card p-8 rounded-xl relative group transition-all duration-300
                             ${plan.badge ? 'border-2 border-violet-500/30' : 'border border-white/10'}`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-violet-500 rounded-full text-sm font-medium text-white">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-3xl font-bold text-${plan.color}-400`}>{plan.price}</span>
                    {plan.period && <span className="text-gray-400 text-sm">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-400">
                      <svg className={`w-5 h-5 text-${plan.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-2 px-4 rounded-lg transition-all duration-300
                    ${plan.badge 
                      ? 'bg-violet-500 text-white hover:bg-violet-600' 
                      : `bg-${plan.color}-500/20 text-${plan.color}-400 hover:bg-${plan.color}-500/30`}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* Add Features Comparison */}
          <div className="glass-card p-8 rounded-xl mt-12">
            <h3 className="text-xl font-bold text-center text-white mb-8">Feature Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-gray-400">Feature</th>
                    <th className="text-center py-4 px-4 text-green-400">Free</th>
                    <th className="text-center py-4 px-4 text-violet-400">Pro</th>
                    <th className="text-center py-4 px-4 text-blue-400">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: 'AI Document Analysis', free: '5/month', pro: 'Unlimited', enterprise: 'Unlimited' },
                    { name: 'Study Tools', free: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
                    { name: 'Lost & Found Posts', free: '2/month', pro: 'Unlimited', enterprise: 'Unlimited' },
                    { name: 'AI Chat Support', free: 'Limited', pro: '24/7', enterprise: 'Priority' },
                    { name: 'Reward System', free: '-', pro: '✓', enterprise: '✓' }
                  ].map((feature, i) => (
                    <tr key={i} className="text-sm">
                      <td className="py-4 px-4 text-gray-300">{feature.name}</td>
                      <td className="text-center py-4 px-4 text-gray-400">{feature.free}</td>
                      <td className="text-center py-4 px-4 text-gray-400">{feature.pro}</td>
                      <td className="text-center py-4 px-4 text-gray-400">{feature.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Enhanced CTA */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-amber-400 to-green-400 bg-clip-text text-transparent">
            Ready to Transform Your Campus Experience?
          </h2>
          <p className="text-gray-400">
            Join thousands of students already using our AI-powered campus tools
          </p>
          <button
            onClick={() => navigate('/tools')}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-amber-600 rounded-xl
                     text-white font-semibold text-lg hover:scale-105 transition-all duration-300"
          >
            Explore Tools
            <span className="ml-2">→</span>
          </button>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="mt-32 py-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-400">Powered by</span>
          <span className="font-semibold bg-gradient-to-r from-violet-400 to-blue-400 
                         bg-clip-text text-transparent">Team TrishulX</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;