import { BASE_URL, getHeaders, handleResponse } from './apiClient.js';

export const chatService = {
  async getChatRooms() {
    const res = await fetch(`${BASE_URL}/chat/rooms`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getRoomMessages(roomId) {
    const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/messages`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async sendChatMessage(roomId, text) {
    const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    return handleResponse(res);
  },

  async joinMatchQueue(topic) {
    const res = await fetch(`${BASE_URL}/chat/match/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ topic })
    });
    return handleResponse(res);
  },

  async blockChatRoom(roomId) {
    const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/block`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getPeerRecommendations(topic) {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    const res = await fetch(`${BASE_URL}/chat/match/recommendations?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async invitePeerToChat(partnerId, topic) {
    const res = await fetch(`${BASE_URL}/chat/match/invite`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ partnerId, topic })
    });
    return handleResponse(res);
  }
};
export default chatService;
