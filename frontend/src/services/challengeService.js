import { BASE_URL, getHeaders, handleResponse } from './apiClient.js';

export const challengeService = {
  async getChallenges() {
    const res = await fetch(`${BASE_URL}/challenges`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async joinChallenge(challengeId) {
    const res = await fetch(`${BASE_URL}/challenges/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ challengeId })
    });
    return handleResponse(res);
  },

  async updateChallengeProgress(userChallengeId) {
    const res = await fetch(`${BASE_URL}/challenges/${userChallengeId}/progress`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
export default challengeService;
