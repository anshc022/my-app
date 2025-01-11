import io from 'socket.io-client';

const COLLAB_API_URL = 'https://unilife-backend-js.onrender.com';
const socket = io(COLLAB_API_URL);

export const examCollabApi = {
  // Room functions
  getRooms: async () => {
    const response = await fetch(`${COLLAB_API_URL}/api/rooms`);
    return response.json();
  },

  createRoom: async (roomData) => {
    try {
      const response = await fetch(`${COLLAB_API_URL}/api/rooms`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(roomData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  deleteRoom: async (roomId, username) => {
    const response = await fetch(`${COLLAB_API_URL}/api/rooms/${roomId}?username=${username}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Add drawing permissions functions
  updateDrawingPermissions: async (roomId, username, targetUsername) => {
    try {
      const response = await fetch(`${COLLAB_API_URL}/api/rooms/${roomId}/drawing-permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, targetUsername })
      });
      return response.json();
    } catch (error) {
      console.error('Failed to update drawing permissions:', error);
      throw error;
    }
  },

  // Resource functions
  getResources: async (roomId) => {
    const response = await fetch(`${COLLAB_API_URL}/api/rooms/${roomId}/resources`);
    return response.json();
  },

  uploadResource: async (roomId, resourceData) => {
    const response = await fetch(`${COLLAB_API_URL}/api/rooms/${roomId}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resourceData)
    });
    return response.json();
  },

  // Add chat summary functions
  getChatSummary: async (roomId) => {
    try {
      console.log('Requesting summary for room:', roomId); // Debug log
      const response = await fetch(`${COLLAB_API_URL}/api/rooms/${roomId}/summary`);
      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }
      const data = await response.json();
      console.log('Summary response:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Failed to get chat summary:', error);
      throw error;
    }
  },

  getTopicFilter: async (roomId, topic) => {
    try {
      const response = await fetch(`${COLLAB_API_URL}/api/rooms/${roomId}/filter?topic=${topic}`);
      return response.json();
    } catch (error) {
      console.error('Failed to filter topics:', error);
      throw error;
    }
  }
};

export const socketService = {
  socket,
  
  joinRoom: (roomId) => {
    const username = localStorage.getItem('username');
    if (!username) {
      console.error('Username not set');
      return;
    }
    socket.emit('joinRoom', { roomId, username });
  },

  leaveRoom: (roomId) => {
    const username = localStorage.getItem('username');
    socket.emit('leaveRoom', { roomId, username });
  },

  sendMessage: (roomId, text, username) => {
    console.log('Sending message:', { roomId, text, username }); // Debug log
    socket.emit('sendMessage', { 
      roomId, 
      text,
      username
    });
  },

  // Add timestamp formatting helper
  formatMessageTime: (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },

  subscribeToMessages: (callback) => {
    socket.on('newMessage', callback);
  },

  subscribeToUserJoined: (callback) => {
    socket.on('userJoined', callback);
  },

  subscribeToParticipants: (callback) => {
    socket.on('participantUpdate', callback);
  },

  subscribeToRoomData: (callback) => {
    socket.on('roomData', callback);
  },

  // Add error handling for messages
  subscribeToMessageError: (callback) => {
    socket.on('messageError', callback);
  },

  subscribeToRoomDeleted: (callback) => {
    socket.on('roomDeleted', callback);
  },

  subscribeToJoinError: (callback) => {
    socket.on('joinError', callback);
  },

  subscribeToKickedFromRoom: (callback) => {
    socket.on('kickedFromRoom', callback);
  },

  emitDrawing: (data) => {
    socket.emit('drawing', data);
  },

  subscribeToDrawing: (callback) => {
    socket.on('drawing', callback);
  },

  unsubscribeFromDrawing: () => {
    socket.off('drawing');
  },

  // Add new drawing sync handlers
  emitDrawingAction: (data) => {
    socket.emit('drawingAction', data);
  },

  subscribeToDrawingAction: (callback) => {
    socket.on('drawingAction', callback);
  },

  unsubscribeFromDrawingAction: () => {
    socket.off('drawingAction');
  },

  // Drawing permissions
  toggleDrawingPermission: (roomId, username, targetUsername) => {
    socket.emit('toggleDrawingPermission', { roomId, username, targetUsername });
  },

  subscribeToDrawingPermissions: (callback) => {
    socket.on('drawingPermissionsUpdated', callback);
  },

  // Drawing history
  requestDrawingHistory: (roomId) => {
    socket.emit('requestDrawingHistory', { roomId });
  },

  subscribeToDrawingHistory: (callback) => {
    socket.on('drawingHistory', callback);
  },

  // Drawing sync
  syncDrawing: (data) => {
    socket.emit('syncDrawing', data);
  },

  subscribeToDrawingSync: (callback) => {
    socket.on('drawingSync', callback);
  },

  // New drawing persistence handlers
  saveDrawing: (roomId, drawingData) => {
    socket.emit('saveDrawing', { roomId, drawingData });
  },

  requestDrawingData: (roomId) => {
    socket.emit('requestDrawingData', { roomId });
  },

  subscribeToDrawingData: (callback) => {
    socket.on('drawingData', callback);
  },

  unsubscribe: () => {
    socket.off('newMessage');
    socket.off('userJoined');
    socket.off('participantUpdate');
    socket.off('roomData');
    socket.off('messageError');
    socket.off('roomDeleted');
    socket.off('joinError');
    socket.off('kickedFromRoom');
    socket.off('drawing');
    socket.off('drawingAction');
    socket.off('drawingPermissionsUpdated');
    socket.off('drawingHistory');
    socket.off('drawingSync');
    socket.off('drawingData');
  }
};
