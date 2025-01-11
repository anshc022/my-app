import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudyRoom from './StudyRoom';

const ExamCollaboration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('room');
  const [roomTitle, setRoomTitle] = useState('Study Rooms');

  const tabs = [
    { id: 'room', label: 'Study Room', icon: '👥' },
    { id: 'whiteboard', label: 'Whiteboard', icon: '✏️' },
    { id: 'resources', label: 'Resources', icon: '📚' },
    { id: 'quiz', label: 'Quizzes', icon: '📝' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    switch (tabId) {
      case 'room':
        setRoomTitle('Study Rooms');
        break;
      case 'resources':
        setRoomTitle('Study Resources');
        break;
      case 'quiz':
        setRoomTitle('Study Quizzes');
        break;
      default:
        setRoomTitle('Study Rooms');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-violet-600/10 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[150px] animate-pulse delay-700"></div>
      </div>

      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate('/tools')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 border border-white/10 transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>
      </div>

      {/* Side Navigation */}
      <div className="fixed left-0 top-0 h-full w-20 bg-gray-800/50 backdrop-blur-xl border-r border-white/10">
        <div className="flex flex-col items-center pt-20 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'hover:bg-gray-700/50 text-gray-400'
              }`}
              title={tab.label}
            >
              <span className="text-2xl">{tab.icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-20 p-8 relative z-10">
        <StudyRoom activeTab={activeTab} roomTitle={roomTitle} />
      </div>
    </div>
  );
};

export default ExamCollaboration;
