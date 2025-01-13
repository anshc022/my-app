import React, { useState, useCallback } from 'react';
import { uploadFile } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

function FileUpload({ onFileProcessed, className }) {
  const [files, setFiles] = useState([]);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [status, setStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelection(droppedFiles);
  };

  const processFile = async (file) => {
    try {
      if (!file) {
        throw new Error('No file selected');
      }

      console.log('Starting file upload:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      setCurrentUpload(file);
      setStatus(`Processing ${file.name}...`);

      const response = await uploadFile(file);
      console.log('Upload response:', response);
      
      if (response.status === 'success') {
        setStatus(`${file.name} processed successfully!`);
        onFileProcessed(response);
        // Remove the processed file from the queue
        setFiles(prev => prev.filter(f => f.name !== file.name));
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`Failed to process ${file?.name}: ${error.message}`);
    } finally {
      setCurrentUpload(null);
    }
  };

  const handleFileSelection = useCallback(async (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setStatus(`${file.name} is too large. Maximum size is 16MB`);
        return false;
      }
      if (!file.type.includes('pdf')) {
        setStatus(`${file.name} is not a PDF file`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      // Process the first file immediately
      if (!currentUpload) {
        processFile(validFiles[0]);
      }
    }
  }, [currentUpload]);

  const handleFileChange = (e) => {
    handleFileSelection(e.target.files);
  };

  const handleRemoveFile = (fileName) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  // Process next file when current upload finishes
  React.useEffect(() => {
    if (!currentUpload && files.length > 0) {
      processFile(files[0]);
    }
  }, [currentUpload, files]);

  return (
    <div className={`${className || ''}`}>
      <div 
        className={`relative rounded-xl transition-all duration-300
          ${isDragging ? 'bg-violet-500/20 scale-105' : 'bg-gray-800/30'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {files.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 text-center"
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div className="text-sm text-gray-400">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500">PDF (up to 16MB)</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-2"
            >
              {files.map((file, index) => (
                <div
                  key={file.name}
                  className={`flex items-center gap-3 p-3 rounded-lg
                    ${currentUpload?.name === file.name ? 'bg-violet-500/20' : 'bg-gray-800/30'}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {currentUpload?.name === file.name ? (
                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <button
                      onClick={() => handleRemoveFile(file.name)}
                      className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Message */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-3 p-3 rounded-lg text-sm ${
                status.includes('success') ? 'bg-green-500/20 text-green-300' :
                status.includes('Failed') ? 'bg-red-500/20 text-red-300' :
                'bg-gray-800/30 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {status.includes('Processing') && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {status}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default FileUpload;