import axios from 'axios';

const AI_API_URL = 'http://localhost:8000'; // Your FastAPI address

export const analyzeDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${AI_API_URL}/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; // This will contain your error coordinates
  } catch (error) {
    console.error("AI Analysis failed", error);
    throw error;
  }
};