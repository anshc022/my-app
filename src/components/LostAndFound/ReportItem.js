import React, { useState, useEffect } from 'react';

const ReportItem = ({ onItemSubmitted, token, editItem = null }) => {
  const [formData, setFormData] = useState(editItem || {
    type: 'lost',
    title: '',
    description: '',
    location: '',
    category: 'other',
    contactInfo: '',
    date: new Date().toISOString().split('T')[0],
    status: 'open',
    tags: []
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
      if (editItem.image) {
        setImagePreview(`data:image/jpeg;base64,${editItem.image}`);
      }
    }
  }, [editItem]);

  const handleImageSearch = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('https://unilife-backend-js.onrender.com/api/lost-items/search-by-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to search by image');

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Image search error:', error);
      setUploadStatus('Failed to search by image');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('File too large. Please select an image under 5MB');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadStatus('Image selected successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const url = editItem 
        ? `https://unilife-backend-js.onrender.com/api/lost-items/${editItem._id}`
        : 'https://unilife-backend-js.onrender.com/api/lost-items';

      const response = await fetch(url, {
        method: editItem ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save report');

      alert(editItem ? 'Report updated successfully!' : 'Report submitted successfully!');
      onItemSubmitted(data.item);
      
      if (!editItem) {
        resetForm();
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'lost',
      title: '',
      description: '',
      location: '',
      category: 'other',
      contactInfo: '',
      date: new Date().toISOString().split('T')[0],
      status: 'open',
      tags: []
    });
    setSelectedImage(null);
    setImagePreview(null);
    setAiAnalysis(null);
    setUploadStatus('');
    setSubmissionResult(null);
    setSearchResults(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {submissionResult?.item.potentialMatches ? (
        <div className="mb-8 bg-green-500/10 p-6 rounded-lg border border-green-500/20">
          <h3 className="text-green-400 font-medium mb-4">Potential Matches Found!</h3>
          <div className="space-y-4">
            {submissionResult.item.potentialMatches.map((match, index) => (
              <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  {match.item.image && (
                    <img
                      src={`data:image/jpeg;base64,${match.item.image}`}
                      alt="Matched item"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className="font-medium">{match.item.title}</h4>
                    <p className="text-sm text-gray-400">Match confidence: {match.similarityScore}%</p>
                    <p className="text-sm text-gray-400 mt-2">{match.analysis}</p>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={resetForm}
              className="w-full mt-4 bg-green-500/20 text-green-400 py-2 px-4 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="flex flex-col space-y-2">
            <label className="text-gray-400">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              required
            >
              <option value="lost">Lost Item</option>
              <option value="found">Found Item</option>
            </select>
          </div>

          {/* Title */}
          <div className="flex flex-col space-y-2">
            <label className="text-gray-400">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              required
              placeholder="Brief title of the item"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-gray-400">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 min-h-[100px]"
              required
              placeholder="Detailed description of the item..."
            />
          </div>

          {/* Category */}
          <div className="flex flex-col space-y-2">
            <label className="text-gray-400">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              required
            >
              <option value="electronics">Electronics</option>
              <option value="documents">Documents</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Location */}
          <div className="flex flex-col space-y-2">
            <label className="text-gray-400">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              required
              placeholder="Where was it lost/found?"
            />
          </div>

          {/* Contact Information */}
          <div className="flex flex-col space-y-2">
            <label className="text-gray-400">Contact Information</label>
            <input
              type="text"
              value={formData.contactInfo}
              onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              required
              placeholder="How can people contact you?"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col space-y-2">
            <label className="text-gray-400">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              required
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col space-y-2">
            <label className="text-gray-400">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({
                ...formData, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              placeholder="Add relevant tags..."
            />
          </div>

          {/* Simplified image upload section */}
          <div className="flex flex-col space-y-2">
            <label className="text-gray-400">Upload Image (helps with matching)</label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Choose Image
              </label>
            </div>

            {uploadStatus && (
              <p className={`text-sm ${
                uploadStatus.includes('large') ? 'text-red-400' : 'text-green-400'
              }`}>
                {uploadStatus}
              </p>
            )}

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg border border-gray-700"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg transition-colors duration-300 ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600'
            } text-white font-semibold`}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      )}

      {searchResults && searchResults.matches.length > 0 && (
        <div className="mt-6 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
          <h3 className="text-amber-400 font-medium mb-4">Potential Matches Found</h3>
          <div className="space-y-4">
            {searchResults.matches.map((match, index) => (
              <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={`data:image/jpeg;base64,${match.item.image}`}
                    alt="Matched item"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium">{match.item.title}</h4>
                    <p className="text-sm text-gray-400">
                      Similarity: {match.similarity}%
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {match.analysis}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportItem;
