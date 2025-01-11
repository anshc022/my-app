import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDesGcuUTHr4F3xw7kP5a3AO1hQMbcl4Kg";
const MODEL_NAME = "gemini-1.5-pro";  // Changed model name

const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiService = {
  summarizeChat: async (messages) => {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });  // Fixed model initialization
      
      const prompt = `
        Analyze and summarize the following chat conversation:
        ${messages.map(m => `${m.user}: ${m.text}`).join('\n')}
        
        Please provide:
        1. Key discussion points
        2. Main topics discussed
        3. A concise summary
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response into structured format
      const sections = text.split('\n\n');
      return {
        keyPoints: sections[0].split('\n').filter(p => p.trim()),
        topics: sections[1].split(',').map(t => t.trim()),
        summary: sections[2]
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  },

  translateMessage: async (text, targetLanguage) => {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });  // Fixed model initialization
      
      const prompt = `Translate the following text to ${targetLanguage}: ${text}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Translation Error:', error);
      throw error;
    }
  }
};
