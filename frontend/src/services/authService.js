import { BASE_URL, getHeaders, handleResponse } from './apiClient.js';

export const authService = {
  async register(email, password, username) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    return handleResponse(res);
  },

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async verifyEmail(code) {
    const res = await fetch(`${BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code })
    });
    return handleResponse(res);
  },

  async forgotPassword(email) {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },

  async resetPassword(token, newPassword) {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    return handleResponse(res);
  },

  async getProfile() {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getPublicStats() {
    const res = await fetch(`${BASE_URL}/auth/public-stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
  }
};
export default authService;
