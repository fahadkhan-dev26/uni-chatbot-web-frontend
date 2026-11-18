import api from './api';

export const systemService = {
  getStatus: () => api.get('/system/status', { timeout: 10_000 }),
};
