import React, { useState, useCallback } from 'react';
import { uploadFile } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

function FileUpload({ onFileProcessed, onStatusChange, className }) {
  const [files, setFiles] = useState([]);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [status, setStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  
  // Add new state for mobile feedback
  const [uploadStatus, setUploadStatus] = useState({
    phase: '', // 'preparing', 'uploading', 'processing', 'complete', 'error'
    progress: 0,
    message: ''
  });

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
      if (!file) throw new Error('No file selected');

      // Clear previous status
      setShowProgress(true);
      setUploadProgress(0);
      
      // Update status for preparation phase
      setUploadStatus({
        phase: 'preparing',
        progress: 0,
        message: 'Preparing your file...'
      });

      // Update parent component status
      onStatusChange({
        isUploading: true,
        progress: 0,
        fileName: file.name,
        phase: 'preparing'
      });

      // Show initial feedback
      const progressInterval = setInterval(() => {
        setUploadStatus(prev => ({
          ...prev,
          phase: 'uploading',
          progress: Math.min(prev.progress + Math.random() * 15, 90),
          message: 'Uploading file...'
        }));
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 15, 90);
          onStatusChange(status => ({
            ...status,
            progress: newProgress,
            phase: 'uploading'
          }));
          return newProgress;
        });
      }, 500);

      setCurrentUpload(file);
      
      // Update status for upload phase
      setUploadStatus(prev => ({
        ...prev,
        phase: 'uploading',
        message: `Uploading ${file.name}...`
      }));

      const response = await uploadFile(file);
      
      clearInterval(progressInterval);
      
      // Update status for processing phase
      setUploadStatus({
        phase: 'processing',
        progress: 95,
        message: 'Processing document...'
      });

      onStatusChange(status => ({
        ...status,
        progress: 95,
        phase: 'processing'
      }));

      if (response.status === 'success') {
        // Success feedback
        setUploadStatus({
          phase: 'complete',
          progress: 100,
          message: `${file.name} ready!`
        });
        
        onStatusChange(status => ({
          ...status,
          progress: 100,
          phase: 'complete'
        }));

        onFileProcessed(response, {
          isUploading: false,
          progress: 100,
          fileName: file.name,
          phase: 'complete'
        });
        setFiles(prev => prev.filter(f => f.name !== file.name));
        
        // Clear success status after a delay
        setTimeout(() => {
          setUploadStatus({ phase: '', progress: 0, message: '' });
          onStatusChange({ isUploading: false, progress: 0, fileName: '', phase: '' });
        }, 2000);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      // Error feedback
      setUploadStatus({
        phase: 'error',
        progress: 0,
        message: `Error: ${error.message}`
      });
      onStatusChange(status => ({
        ...status,
        progress: 0,
        phase: 'error'
      }));
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

  const handleMobileUpload = () => {
    // Trigger file input click for mobile
    document.getElementById('mobile-file-input').click();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const ProgressBar = ({ progress }) => (
    <div className="relative w-full h-1 bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-violet-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );

  const FileItem = ({ file, isUploading }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex items-center gap-3 p-3 rounded-lg
        ${isUploading ? 'bg-violet-500/20' : 'bg-gray-800/30'}`}
    >
      <div className="w-10 h-10 rounded-lg bg-violet-500/30 flex items-center justify-center">
        <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 truncate">{file.name}</p>
        <div className="space-y-1">
          <p className="text-xs text-gray-400">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          {isUploading && showProgress && (
            <>
              <ProgressBar progress={uploadProgress} />
              <p className="text-xs text-violet-300">{Math.round(uploadProgress)}%</p>
            </>
          )}
        </div>
      </div>
      {isUploading ? (
        <div className="upload-progress">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <button
          onClick={() => handleRemoveFile(file.name)}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors
                   active:scale-95 touch-action-manipulation"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );

  // Add mobile-optimized progress indicator
  const MobileProgress = ({ status }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-x-0 bottom-0 z-50 p-4 pointer-events-none sm:hidden"
    >
      <div className="bg-gray-900/95 border border-white/10 rounded-xl p-4 backdrop-blur-md shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-200">
              {status.phase === 'preparing' && '📋 Preparing...'}
              {status.phase === 'uploading' && '📤 Uploading...'}
              {status.phase === 'processing' && '⚡ Processing...'}
              {status.phase === 'complete' && '✅ Complete!'}
              {status.phase === 'error' && '❌ Error'}
            </span>
            <span className="text-sm text-gray-400">
              {status.progress > 0 && `${Math.round(status.progress)}%`}
            </span>
          </div>
          
          <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${
                status.phase === 'error' ? 'bg-red-500' :
                status.phase === 'complete' ? 'bg-green-500' :
                'bg-violet-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${status.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <p className="text-xs text-gray-400">{status.message}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`${className || ''}`}>
      <div 
        className={`relative rounded-xl transition-all duration-300
          ${isDragging ? 'bg-violet-500/20 scale-105' : 'bg-gray-800/30'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          {files.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 md:p-6 text-center"
            >
              <input
                id="mobile-file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                capture="environment"
              />
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                
                {/* Mobile Upload Button */}
                <button
                  onClick={handleMobileUpload}
                  className="w-full sm:w-auto px-4 py-2 bg-violet-600 text-white rounded-lg
                           flex items-center justify-center gap-2 mx-auto
                           active:scale-95 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">Upload PDF</span>
                </button>

                <div className="text-sm text-gray-400">
                  <span className="hidden sm:inline">or drag and drop</span>
                  <span className="sm:hidden">Max file size: 16MB</span>
                </div>
                <p className="text-xs text-gray-500">Supported format: PDF</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 space-y-2"
            >
              {files.map((file) => (
                <FileItem
                  key={file.name}
                  file={file}
                  isUploading={currentUpload?.name === file.name}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Message with improved mobile visibility */}
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

      {/* Mobile Instructions */}
      <div className="mt-4 text-center sm:hidden">
        <p className="text-xs text-gray-400">
          Tap the upload button to select a PDF file from your device
        </p>
      </div>
      
      {/* Add MobileProgress component */}
      <AnimatePresence>
        {uploadStatus.phase && (
          <MobileProgress status={uploadStatus} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default FileUpload;