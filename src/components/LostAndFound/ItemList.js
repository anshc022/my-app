import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Add timeAgo helper function at the top
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000; // years
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000; // months
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400; // days
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600; // hours
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60; // minutes
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
};

const ItemCard = ({ item, onClaimItem }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const handleClaim = async (itemId) => {
    await onClaimItem(itemId);
    setShowContactInfo(true);
  };

  return (
    <motion.div
      key={item._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-xl hover:shadow-amber-500/10 transition-all duration-300"
    >
      <div className="flex flex-col space-y-4">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                item.type === 'lost' 
                  ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border border-red-500/20' 
                  : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/20'
              }`}>
                {item.type.toUpperCase()}
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20">
                {item.category.toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {item.title}
            </h3>
          </div>
        </div>

        {/* Image with Gradient Overlay */}
        {item.image && (
          <div className="relative rounded-lg overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60 z-10"></div>
            <img
              src={`data:image/jpeg;base64,${item.image}`}
              alt={item.title}
              className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-3 left-3 z-20 flex gap-2 text-sm text-gray-300">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                </svg>
                {timeAgo(item.date)}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-400 line-clamp-2 hover:line-clamp-none transition-all duration-300">
          {item.description}
        </p>

        {/* Location & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="text-sm">{item.location}</span>
          </div>
          
          {item.type === 'found' && item.status === 'open' && (
            <button
              onClick={() => handleClaim(item._id)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 
                       hover:from-amber-500/30 hover:to-orange-500/30 rounded-lg transition-all duration-300
                       border border-amber-500/20 hover:border-amber-500/40"
            >
              {showContactInfo ? 'View Contact Info' : 'Claim Item'}
            </button>
          )}
        </div>

        {/* Contact Info Display */}
        {showContactInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20"
          >
            <h4 className="text-green-400 font-medium mb-3">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <svg className="w-4 h-4 mr-2 text-green-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span>{item.contactInfo}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <svg className="w-4 h-4 mr-2 text-green-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{item.location}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const ItemList = ({ items, loading, onItemUpdate, onClaimItem }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
        <div className="text-center py-8">
          <h3 className="text-xl font-medium mb-4 text-amber-400">No Items Available</h3>
          <p className="text-gray-400 mb-4">
            You need to report an item first to see relevant listings:
          </p>
          <ul className="text-gray-400 text-sm mb-6 space-y-2">
            <li>• Report a lost item to see found items</li>
            <li>• Report a found item to see lost items</li>
          </ul>
          <p className="text-gray-500 text-sm">
            This helps match the right items with the right people.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item) => (
        <ItemCard 
          key={item._id} 
          item={item} 
          onClaimItem={onClaimItem}
        />
      ))}
    </div>
  );
};

export default ItemList;
