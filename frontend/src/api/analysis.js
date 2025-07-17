import api from './index';

export const analyzeRepository = async (repoUrl) => {
  try {
    const response = await api.post('/analyze', { repoUrl });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAnalysisStatus = async (id) => {
  try {
    const response = await api.get(`/analyze/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};