import api from './index';

export const getRepoInfo = async (repoUrl) => {
  try {
    const response = await api.get('/repo/info', { params: { url: repoUrl } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};