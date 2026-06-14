import { BASE_URL, getHeaders, handleResponse } from './apiClient.js';

export const notificationService = {
  async getNotifications() {
    const res = await fetch(`${BASE_URL}/notifications`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
export default notificationService;
