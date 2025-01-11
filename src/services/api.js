const API_URL = process.env.REACT_APP_API_URL || 'https://unilife-back-python.onrender.com/api';
const MAX_RETRIES = 3;
const TIMEOUT = 60000; // Increase timeout to 60 seconds

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
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return { status: 'success', analysis: data.analysis };
    } catch (error) {
      retries--;
      if (error.name === 'AbortError') {
        throw new Error('Upload timed out. Please try again with a smaller file or better connection.');
      }
      if (retries === 0) {
        throw new Error('Upload failed after multiple attempts. Please try again.');
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay between retries
    }
  }
};

export const sendQuery = async (message, isDocMode = false) => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_URL}/health`);
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
    const response = await fetch(`${API_URL}/create-quiz`, {
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
    const response = await fetch(`${API_URL}/generate-study-guide`, {
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
    const response = await fetch(`${API_URL}/generate-knowledge-graph`, {
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
    const response = await fetch(`${API_URL}/generate-flashcards`, {
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
    const response = await fetch(`${API_URL}/track-progress`, {
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