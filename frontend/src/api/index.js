import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Matches backend port
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;