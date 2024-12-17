import axios from 'axios';

// For development
const API_BASE_URL = 'http://localhost:3001';

// For production
// const API_BASE_URL = 'https://realizer.playnet.lol';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include API key from localStorage
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('apiKey');
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});