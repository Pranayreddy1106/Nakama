import { BASE_URL, getHeaders, handleResponse } from './apiClient.js';

export const adminService = {
  async getAdminStats() {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getAdminUsers() {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateUserStatus(userId, action) {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ action })
    });
    return handleResponse(res);
  },

  async getFlaggedReports() {
    const res = await fetch(`${BASE_URL}/admin/reports`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async resolveFlaggedReport(reportId, decision) {
    const res = await fetch(`${BASE_URL}/admin/reports/${reportId}/resolve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ decision })
    });
    return handleResponse(res);
  }
};
export default adminService;
