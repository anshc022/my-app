import React, { useState } from 'react';

const KnowledgeGraphModal = ({ isOpen, onClose, graphData }) => {
  const [activeTab, setActiveTab] = useState('visual');
  if (!isOpen) return null;

  let nodes = [];
  let edges = [];
  let rawData = '';

  try {
    const graphJson = typeof graphData === 'string' ? JSON.parse(graphData) : graphData;
    nodes = graphJson.nodes || [];
    edges = graphJson.edges || [];
    rawData = JSON.stringify(graphJson, null, 2);
  } catch (err) {
    console.error('Error parsing graph data:', err);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-gray-900 border border-gray-800/50 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col relative z-10">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Knowledge Graph</h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-gray-800/50 p-1">
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  activeTab === 'visual' ? 'bg-violet-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Visual
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  activeTab === 'raw' ? 'bg-violet-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Raw Data
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {activeTab === 'visual' ? (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-3">Concepts</h3>
                <div className="grid gap-2">
                  {nodes.map((node, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-3 flex items-center">
                      <span className="text-violet-400 font-medium">{node.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-3">Relationships</h3>
                <div className="grid gap-2">
                  {edges.map((edge, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">{edge.from}</span>
                        <span className="text-violet-400">→</span>
                        <span className="text-gray-300">{edge.to}</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{edge.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <pre className="text-gray-300 overflow-x-auto whitespace-pre-wrap">
                {rawData}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphModal;
