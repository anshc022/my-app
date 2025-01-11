import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { examCollabApi, socketService } from '../../services/examCollabService';
import Whiteboard from './Whiteboard';  // Make sure this import is correct
import { geminiService } from '../../services/geminiService';

const StudyRoom = ({ activeTab, roomTitle }) => {
  // Add new ref for message container
  const messageContainerRef = useRef(null);
  
  // Move showUsernameModal state declaration before username state
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  
  // Then initialize username state
  const [username] = useState(() => {
    return localStorage.getItem('username') || '';
  });

  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [newRoomData, setNewRoomData] = useState({ name: '', topic: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomView, setShowRoomView] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinUsername, setJoinUsername] = useState('');
  const [roomToJoin, setRoomToJoin] = useState(null);
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [drawingPermissions, setDrawingPermissions] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [chatSummary, setChatSummary] = useState(null);
  const [topicFilter, setTopicFilter] = useState('all');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [translationLanguage, setTranslationLanguage] = useState('');
  const [translatedMessages, setTranslatedMessages] = useState({});

  // Add state for context menu
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, messageId: null });
  const [longPressTimer, setLongPressTimer] = useState(null);
  
  // Add handleKickParticipant function
  const handleKickParticipant = async (participantId) => {
    if (selectedRoom && window.confirm('Are you sure you want to remove this participant?')) {
      try {
        await fetch(`${process.env.REACT_APP_COLLAB_API_URL}/api/rooms/${selectedRoom._id}/kick`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            participantId
          })
        });

        // Update participants list
        const updatedParticipants = participants.filter(p => p.id !== participantId);
        setParticipants(updatedParticipants);

        // Add system message
        const systemMessage = {
          user: 'System',
          text: `A participant has been removed from the room`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMessage]);

      } catch (error) {
        console.error('Failed to kick participant:', error);
      }
    }
  };

  useEffect(() => {
    // Fetch rooms on component mount
    if (activeTab === 'room') {
      loadRooms();
    }

    // Socket subscriptions
    socketService.subscribeToMessages((message) => {
      console.log('New message received:', message);
      // Only add message if it's not already in the list
      setMessages(prev => {
        const isDuplicate = prev.some(
          m => m.text === message.text && 
          m.user === message.user && 
          new Date(m.timestamp).getTime() === new Date(message.timestamp).getTime()
        );
        return isDuplicate ? prev : [...prev, message];
      });
    });

    socketService.subscribeToRoomData(({ room, message }) => {
      console.log('Room data update:', message);
      if (room) {
        setMessages(room.messages || []);
        // Ensure participants is always an array
        setParticipants(Array.isArray(room.participants) ? room.participants : []);
      }
    });

    // Subscribe to room deletion
    socketService.subscribeToRoomDeleted(({ message }) => {
      console.log(message);
      setShowRoomView(false);
      setSelectedRoom(null);
      loadRooms();
    });

    // Add kicked from room handler
    socketService.socket.on('kickedFromRoom', ({ message }) => {
      alert(message);
      handleLeaveRoom();
    });

    socketService.socket.on('drawingPermissionsUpdated', ({ permissions }) => {
      setDrawingPermissions(permissions);
    });

    return () => {
      if (selectedRoom) {
        socketService.leaveRoom(selectedRoom._id);
      }
      socketService.unsubscribe();
      socketService.socket.off('kickedFromRoom');
      socketService.socket.off('drawingPermissionsUpdated');
    };
  }, [activeTab, selectedRoom]);

  // Add useEffect for auto-scroll
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add click handler to close context menu
  useEffect(() => {
    const handleClick = () => setContextMenu({ show: false, x: 0, y: 0, messageId: null });
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const loadRooms = async () => {
    try {
      const data = await examCollabApi.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  // Add a check for username before allowing room operations
  const handleRoomClick = (room) => {
    if (!username) {
      setRoomToJoin(room);
      setShowUsernameModal(true);
    } else {
      handleJoinRoom(room);
    }
  };

  const handleJoinRoom = (room) => {
    if (!username) {
      setShowUsernameModal(true);
      return;
    }
    setSelectedRoom(room);
    setShowRoomView(true);
    socketService.joinRoom(room._id);
    loadRoomResources(room._id);
  };

  const handleLeaveRoom = () => {
    if (selectedRoom) {
      socketService.leaveRoom(selectedRoom._id);
      setShowRoomView(false);
      setSelectedRoom(null);
      setMessages([]);
    }
  };

  // Prevent message sending without username
  const handleSendMessage = () => {
    if (!username) {
      setShowUsernameModal(true);
      return;
    }
    if (selectedRoom && newMessage.trim()) {
      console.log('Sending message:', {
        roomId: selectedRoom._id,
        text: newMessage.trim(),
        username
      });

      socketService.sendMessage(
        selectedRoom._id,
        newMessage.trim(),
        username
      );
      
      // Remove the optimistic update since we'll get the message from the socket
      setNewMessage('');
    }
  };

  const loadRoomResources = async (roomId) => {
    try {
      const data = await examCollabApi.getResources(roomId);
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const roomData = {
        name: newRoomData.name.trim(),
        topic: newRoomData.topic.trim(),
        username: username
      };

      const response = await examCollabApi.createRoom(roomData);
      if (response._id) {
        setShowCreateModal(false);
        setNewRoomData({ name: '', topic: '' });
        loadRooms();
      } else {
        console.error('Failed to create room:', response.error);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await examCollabApi.deleteRoom(roomId, username);
        loadRooms();
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
  };

  const handleCreateRoomClick = () => {
    if (!username) {
      setShowUsernameModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleSetUsername = () => {
    if (adminUsername.trim()) {
      localStorage.setItem('username', adminUsername);
      window.location.reload(); // Reload to update username state
    }
  };

  const handleJoinWithUsername = () => {
    if (joinUsername.trim()) {
      localStorage.setItem('username', joinUsername.trim());
      window.location.reload(); // Reload to update username state
    }
  };

  const handleToggleDrawingPermission = (targetUsername) => {
    if (selectedRoom?.createdBy === username) {
      socketService.socket.emit('toggleDrawingPermission', {
        roomId: selectedRoom._id,
        username,
        targetUsername
      });
    }
  };

  const handleGenerateSummary = async () => {
    try {
      console.log('Starting summary generation...');
      setChatSummary(null);
      setShowSummary(true);

      if (!selectedRoom?._id) {
        throw new Error('No room selected');
      }

      if (!messages.length) {
        setChatSummary({
          keyPoints: ['No messages to summarize'],
          topics: ['No topics yet'],
          summary: 'Start a conversation to generate a summary.'
        });
        return;
      }

      // Log the request details
      console.log('Requesting summary for room:', selectedRoom._id);
      console.log('Messages count:', messages.length);

      const summary = await fetch(`${process.env.REACT_APP_COLLAB_API_URL}/api/rooms/${selectedRoom._id}/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await summary.json();
      console.log('Summary response:', data);

      if (!summary.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setChatSummary(data);
    } catch (error) {
      console.error('Summary generation error:', error);
      setChatSummary({
        keyPoints: ['Error occurred while generating summary'],
        topics: ['Error'],
        summary: `Failed to generate summary: ${error.message}. Please try again.`
      });
    }
  };

  const handleTopicFilter = async (topic) => {
    try {
      if (topic === 'all') {
        setFilteredMessages(messages);
      } else {
        const filtered = await examCollabApi.getTopicFilter(selectedRoom._id, topic);
        setFilteredMessages(filtered.messages);
      }
      setTopicFilter(topic);
    } catch (error) {
      console.error('Failed to filter topics:', error);
    }
  };

  // Add translation handler
  const handleTranslateMessage = async (messageId, text) => {
    try {
      if (!translationLanguage) return;
      
      const translation = await geminiService.translateMessage(text, translationLanguage);
      setTranslatedMessages(prev => ({
        ...prev,
        [messageId]: translation
      }));
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  // Add message deletion handler
  const handleDeleteMessage = async (messageId) => {
    if (!selectedRoom || !username) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_COLLAB_API_URL}/api/rooms/${selectedRoom._id}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        // Message will be removed through socket update
        console.log('Message deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  // Add context menu handlers
  const handleContextMenu = (e, messageId, isOwnMessage) => {
    e.preventDefault();
    if (!isOwnMessage) return;
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      messageId
    });
  };

  // Add touch handlers for long press
  const handleTouchStart = (e, messageId, isOwnMessage) => {
    if (!isOwnMessage) return;
    
    const timer = setTimeout(() => {
      const touch = e.touches[0];
      setContextMenu({
        show: true,
        x: touch.clientX,
        y: touch.clientY,
        messageId
      });
    }, 500); // 500ms for long press

    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const renderUsernameModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Set Your Username</h2>
        <p className="text-gray-400 mb-4">Please set a username to create and manage rooms.</p>
        <input
          type="text"
          placeholder="Enter your username"
          className="w-full bg-gray-700 rounded-lg px-4 py-2 mb-4"
          value={adminUsername}
          onChange={(e) => setAdminUsername(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-700 rounded-lg"
            onClick={() => setShowUsernameModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-violet-500 rounded-lg"
            onClick={handleSetUsername}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const renderJoinModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Enter Your Name</h2>
        <p className="text-gray-400 mb-4">Please enter your name to join the study room.</p>
        <input
          type="text"
          placeholder="Your name"
          className="w-full bg-gray-700 rounded-lg px-4 py-2 mb-4"
          value={joinUsername}
          onChange={(e) => setJoinUsername(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJoinWithUsername()}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-700 rounded-lg"
            onClick={() => {
              setShowJoinModal(false);
              setRoomToJoin(null);
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-violet-500 rounded-lg disabled:opacity-50"
            onClick={handleJoinWithUsername}
            disabled={!joinUsername.trim()}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );

  // Update the room list rendering to use participantCount
  const renderRoomList = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <motion.div
            key={room._id}  // Changed from room.id to room._id for MongoDB
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-xl bg-gray-800/50 border border-white/10 
                     hover:border-violet-500/50 transition-all duration-300 cursor-pointer"
            onClick={() => handleRoomClick(room)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{room.name}</h3>
                <p className="text-sm text-gray-400">Admin: {room.createdBy}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-sm">
                  {room.participantCount || 0} online
                </span>
                {/* ...rest of the buttons... */}
              </div>
            </div>
            <p className="text-gray-400 mb-4">Topic: {room.topic}</p>
          </motion.div>
        ))}
      </div>

      {showJoinModal && renderJoinModal()}
      {showUsernameModal && renderUsernameModal()}

      {/* Create Room Modal */}
      {showCreateModal && renderCreateRoomModal()}
    </>
  );

  const renderCreateRoomModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Study Room</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Room Name</label>
            <input
              type="text"
              placeholder="Enter room name"
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
              value={newRoomData.name}
              onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Topic</label>
            <input
              type="text"
              placeholder="Enter topic"
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
              value={newRoomData.topic}
              onChange={(e) => setNewRoomData({ ...newRoomData, topic: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 bg-gray-700 rounded-lg"
            onClick={() => setShowCreateModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-violet-500 rounded-lg disabled:opacity-50"
            onClick={handleCreateRoom}
            disabled={!newRoomData.name.trim() || !newRoomData.topic.trim()}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );

  const renderMessage = (msg, index) => {
    if (msg.user === 'System') {
      return (
        <div key={index} className="flex justify-center my-4">
          <div className="bg-gray-800/50 px-4 py-2 rounded-full">
            <p className="text-sm text-gray-400">
              {msg.text}
              <span className="ml-2 text-xs opacity-50">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </p>
          </div>
        </div>
      );
    }

    const isOwnMessage = msg.user === username;

    return (
      <div 
        key={index} 
        className={`flex items-start gap-2 mb-4 ${
          isOwnMessage ? 'flex-row-reverse' : ''
        }`}
        onContextMenu={(e) => handleContextMenu(e, msg._id, isOwnMessage)}
        onTouchStart={(e) => handleTouchStart(e, msg._id, isOwnMessage)}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
          {msg.user[0].toUpperCase()}
        </div>
        <div className={`max-w-[70%] relative ${
          msg.user === username 
            ? 'bg-violet-500/20 ml-auto' 
            : 'bg-gray-700/50'
        } rounded-lg p-3`}>
          {/* Add delete button for user's own messages */}
          {msg.user === username && (
            <button
              onClick={() => handleDeleteMessage(msg._id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                       transition-opacity duration-200 text-red-400 hover:text-red-300"
              title="Delete message"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <div className={`text-sm font-medium ${
            msg.user === username ? 'text-violet-400' : 'text-blue-400'
          } mb-1`}>
            {msg.user}
          </div>
          <p className="text-gray-200">{msg.text}</p>
          <span className="text-xs text-gray-500 mt-1 block">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="relative group">
          {/* Existing message content */}
          {translationLanguage && (
            <button
              onClick={() => handleTranslateMessage(index, msg.text)}
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 
                       transition-opacity duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </button>
          )}
          {translatedMessages[index] && (
            <div className="mt-2 text-sm text-gray-400 italic">
              {translatedMessages[index]}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderParticipantsModal = () => {
    // Deduplicate participants by name
    const uniqueParticipants = participants.reduce((acc, current) => {
      const x = acc.find(item => item.name === current.name);
      if (!x) {
        return acc.concat([current]);
      } else {
        // If we find a duplicate, keep the one with the most recent socket ID
        return acc;
      }
      return acc;
    }, []);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Participants ({uniqueParticipants.length})</h2>
            <button 
              onClick={() => setShowParticipantsList(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {uniqueParticipants.length > 0 ? (
              uniqueParticipants.map((participant, index) => (
                <div 
                  key={participant.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg mb-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                      {participant?.name ? participant.name[0].toUpperCase() : '?'}
                    </div>
                    <span>{participant?.name || 'Anonymous'}</span>
                  </div>
                  {selectedRoom?.createdBy === username && participant?.name !== username && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleDrawingPermission(participant.name)}
                        className={`p-2 ${
                          drawingPermissions.includes(participant.name)
                            ? 'text-violet-400 hover:text-violet-300'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                        title={`${
                          drawingPermissions.includes(participant.name)
                            ? 'Revoke drawing permission'
                            : 'Grant drawing permission'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleKickParticipant(participant.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                        title="Remove participant"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No participants yet
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderChatSummary = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Chat Summary</h2>
          <button 
            onClick={() => setShowSummary(false)}
            className="text-gray-400 hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        {chatSummary ? (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Key Points</h3>
              <ul className="list-disc list-inside space-y-2">
                {chatSummary.keyPoints?.map((point, index) => (
                  <li key={index} className="text-gray-300">{point}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Topics Discussed</h3>
              <div className="flex flex-wrap gap-2">
                {chatSummary.topics?.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleTopicFilter(topic)}
                    className={`px-3 py-1 rounded-full ${
                      topicFilter === topic
                        ? 'bg-violet-500 text-white'
                        : 'bg-gray-600/50 hover:bg-gray-600'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-gray-300 whitespace-pre-line">{chatSummary.summary}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Generating summary...</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRoomHeader = () => (
    <div className="bg-gray-800/50 p-4 rounded-t-xl flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">{selectedRoom.name}</h2>
        <p className="text-gray-400 text-sm">Topic: {selectedRoom.topic}</p>
      </div>
      <div className="flex items-center gap-4">
        {!showWhiteboard && (
          <button
            onClick={handleGenerateSummary}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30"
            title="Generate AI Summary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>AI Summary</span>
          </button>
        )}
        <button
          onClick={() => setShowWhiteboard(!showWhiteboard)}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
            showWhiteboard 
              ? 'bg-violet-500 text-white' 
              : 'bg-violet-500/20 text-violet-400'
          } hover:bg-violet-500/30`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>{showWhiteboard ? 'Show Chat' : 'Show Whiteboard'}</span>
        </button>
        <button
          onClick={() => setShowParticipantsList(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{selectedRoom.participants?.length || 0}</span>
        </button>
        <button
          onClick={handleLeaveRoom}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
        >
          Leave Room
        </button>
        <select
          value={translationLanguage}
          onChange={(e) => setTranslationLanguage(e.target.value)}
          className="px-3 py-1 bg-gray-700/50 rounded-lg text-sm"
        >
          <option value="">Translation Off</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
        </select>
      </div>
    </div>
  );

  const renderRoomView = () => (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {renderRoomHeader()}
      <div className="flex-1 bg-gray-800/30 overflow-hidden">
        {showWhiteboard ? (
          <Whiteboard 
            roomId={selectedRoom._id}
            isAdmin={selectedRoom.createdBy === username}
            username={username}
            drawingPermissions={drawingPermissions}
          />
        ) : (
          <div 
            ref={messageContainerRef}
            className="h-full p-4 overflow-y-auto scroll-smooth"
          >
            <div className="space-y-4">
              {messages.map((msg, index) => renderMessage(msg, index))}
            </div>
          </div>
        )}
      </div>
      {!showWhiteboard && (
        <div className="bg-gray-800/50 p-4 rounded-b-xl">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-gray-700/50 rounded-lg px-4 py-2 
                       border border-white/10 focus:border-violet-500/50 outline-none"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-violet-500 hover:bg-violet-600 
                       rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
      {renderContextMenu()} {/* Add context menu */}
      {showParticipantsList && renderParticipantsModal()}
    </div>
  );

  const renderContextMenu = () => {
    if (!contextMenu.show) return null;

    return (
      <div 
        className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2"
        style={{
          left: contextMenu.x,
          top: contextMenu.y,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <button
          onClick={() => {
            handleDeleteMessage(contextMenu.messageId);
            setContextMenu({ show: false, x: 0, y: 0, messageId: null });
          }}
          className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700/50"
        >
          Delete Message
        </button>
      </div>
    );
  };

  const renderResources = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.map((resource) => (
        <motion.div
          key={resource.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 rounded-xl bg-gray-800/50 border border-white/10 
                   hover:border-violet-500/50 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold mb-2">{resource.name}</h3>
              <p className="text-sm text-gray-400">Size: {resource.size}</p>
              <p className="text-sm text-gray-400">{resource.downloads} downloads</p>
            </div>
            <button className="px-3 py-1 bg-violet-500/20 hover:bg-violet-500/30 
                           rounded-lg transition-all duration-300">
              Download
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderContent = () => (
    <>
      {showRoomView && selectedRoom ? (
        <>
          {activeTab === 'whiteboard' ? (
            <Whiteboard roomId={selectedRoom._id} />
          ) : (
            renderRoomView()
          )}
        </>
      ) : (
        (() => {
          switch (activeTab) {
            case 'room':
              return renderRoomList();
            case 'resources':
              return renderResources();
            case 'quiz':
              return (
                <div className="text-center py-20">
                  <h3 className="text-2xl font-semibold mb-4">Quiz Feature Coming Soon</h3>
                  <p className="text-gray-400">Interactive quizzes and assessments will be available soon!</p>
                </div>
              );
            default:
              return renderRoomList();
          }
        })()
      )}
      {showSummary && renderChatSummary()}
    </>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 
                     to-blue-400 bg-clip-text text-transparent">
          {roomTitle}
        </h1>
        {activeTab === 'room' && (
          <button
            onClick={handleCreateRoomClick}
            className="px-4 py-2 bg-violet-500 hover:bg-violet-600 rounded-lg transition-all duration-300"
          >
            Create Room
          </button>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default StudyRoom;
