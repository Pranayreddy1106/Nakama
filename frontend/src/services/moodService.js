import { BASE_URL, getHeaders, handleResponse } from './apiClient.js';

export const moodService = {
  async getMoodEntries() {
    const res = await fetch(`${BASE_URL}/mood`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async checkInMood(mood, note, date = null) {
    const res = await fetch(`${BASE_URL}/mood`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mood, note, date })
    });
    return handleResponse(res);
  },

  async editMoodEntry(id, mood, note) {
    const res = await fetch(`${BASE_URL}/mood/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ mood, note })
    });
    return handleResponse(res);
  },

  async getMoodInsights() {
    const res = await fetch(`${BASE_URL}/mood/insights`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
export default moodService;
