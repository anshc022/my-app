
import React from 'react';

function StudyGuideModal({ isOpen, onClose, studyGuide }) {
  if (!isOpen) return null;

  // Parse study guide sections
  const sections = studyGuide?.studyGuide?.split(/(?=Definitions:|Key Examples:|Review Points:)/) || [];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-violet-400">Study Guide</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => {
            const [title, ...content] = section.trim().split('\n');
            return (
              <div key={index} className="glass-card p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-violet-300 mb-3">
                  {title.replace(':', '')}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <tbody>
                      {content.map((line, i) => (
                        <tr key={i} className="border-b border-gray-800">
                          {title.includes('Definitions') ? (
                            // Split definition lines into term and definition
                            <>
                              <td className="py-2 px-4 font-medium text-violet-200 w-1/3">
                                {line.split(':')[0]}
                              </td>
                              <td className="py-2 px-4 text-gray-300">
                                {line.split(':')[1]}
                              </td>
                            </>
                          ) : (
                            <td className="py-2 px-4 text-gray-300">{line}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StudyGuideModal;