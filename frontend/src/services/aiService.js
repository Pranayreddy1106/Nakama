import { BASE_URL, getHeaders, handleResponse } from './apiClient.js';

export const aiService = {
  async askCompanion(message, history = []) {
    const res = await fetch(`${BASE_URL}/ai/companion`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, history })
    });
    return handleResponse(res);
  }
};
export default aiService;
