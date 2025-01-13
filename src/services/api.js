const API_URL = process.env.REACT_APP_MAIN_API_URL || 'https://unilife-back-python.onrender.com/api';
const MAX_RETRIES = 3;
const TIMEOUT = 60000;

// Updated headers configuration
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Enhanced fetch with simpler CORS handling
const safeFetch = async (url, options = {}) => {
  const defaultOptions = {
    mode: 'cors',
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  let retries = MAX_RETRIES;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  
  while (retries > 0) {
    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type here, let the browser set it with the boundary
        },
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Upload attempt failed:', error);
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

export const sendQuery = async (message, isDocMode = false) => {
  try {
    const response = await safeFetch(`${API_URL}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        mode: isDocMode ? 'document' : 'general'
      })
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await safeFetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const processAnalysis = async (analysisText) => {
  try {
    const sections = analysisText.split(/(?=SUMMARY:|FLASHCARDS:|STUDY GUIDE:)/);
    return {
      summary: sections.find(s => s.includes('SUMMARY:'))?.replace('SUMMARY:', '').trim(),
      flashcards: sections.find(s => s.includes('FLASHCARDS:'))?.replace('FLASHCARDS:', '').trim(), // Fixed missing parenthesis
      studyGuide: sections.find(s => s.includes('STUDY GUIDE:'))?.replace('STUDY GUIDE:', '').trim()
    };
  } catch (error) {
    console.error('Error processing analysis:', error);
    return null;
  }
};

export const createQuiz = async (notes) => {
  try {
    const response = await safeFetch(`${API_URL}/create-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        notes: notes.studyGuide + "\n" + notes.summary 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const generateStudyGuide = async (notes) => {
  try {
    const response = await safeFetch(`${API_URL}/generate-study-guide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const generateKnowledgeGraph = async (notes) => {
  try {
    const response = await safeFetch(`${API_URL}/generate-knowledge-graph`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const generateFlashcards = async (notes) => {
  try {
    const response = await safeFetch(`${API_URL}/generate-flashcards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const trackProgress = async (progressData) => {
  try {
    const response = await safeFetch(`${API_URL}/track-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progress: progressData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};