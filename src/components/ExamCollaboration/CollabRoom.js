import React, { useState } from 'react';

const CollabRoom = () => {
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Physics Study Group', participants: 5, topic: 'Quantum Mechanics' },
    { id: 2, name: 'Math Group', participants: 3, topic: 'Calculus' },
    // Add more sample rooms
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
          Study Rooms
        </h1>
        <button className="px-4 py-2 bg-violet-500 hover:bg-violet-600 rounded-lg transition-all duration-300">
          Create Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <div 
            key={room.id}
            className="p-6 rounded-xl bg-gray-800/50 border border-white/10 hover:border-violet-500/50 transition-all duration-300 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{room.name}</h3>
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-sm">
                {room.participants} online
              </span>
            </div>
            <p className="text-gray-400 mb-4">Topic: {room.topic}</p>
            <button className="w-full px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 rounded-lg transition-all duration-300">
              Join Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollabRoom;
