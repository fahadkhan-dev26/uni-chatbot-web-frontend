import api from './api';

export const healthService = {
  getHealth: () => api.get('/health'),
};
