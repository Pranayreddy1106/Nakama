import { BASE_URL, getHeaders, handleResponse } from './apiClient.js';

export const gratitudeService = {
  async getGratitudes() {
    const res = await fetch(`${BASE_URL}/gratitude`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createGratitude(content) {
    const res = await fetch(`${BASE_URL}/gratitude`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    });
    return handleResponse(res);
  },

  async supportGratitude(id) {
    const res = await fetch(`${BASE_URL}/gratitude/${id}/support`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
export default gratitudeService;
