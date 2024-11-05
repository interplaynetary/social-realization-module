import { api } from './config';

export const authService = {
  async login(apiKey: string) {
    const response = await api.post('/login', { apiKey });
    if (response.data.success) {
      localStorage.setItem('apiKey', apiKey);
      localStorage.setItem('playerId', response.data.playerId);
    }
    return response.data;
  },

  async register(playerName: string) {
    const response = await api.post('/register', { playerName });
    if (response.data.success) {
      localStorage.setItem('apiKey', response.data.apiKey);
      localStorage.setItem('playerId', response.data.playerId);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('playerId');
  }
};