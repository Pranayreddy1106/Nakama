import { BASE_URL, getHeaders, handleResponse } from './apiClient.js';

export const postService = {
  async getAllPosts({ category, mood, search, sort, skip, limit }) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (mood) params.append('mood', mood);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    if (skip) params.append('skip', skip);
    if (limit) params.append('limit', limit);

    const res = await fetch(`${BASE_URL}/posts?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getPostById(id) {
    const res = await fetch(`${BASE_URL}/posts/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createPost(postData) {
    const res = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(postData)
    });
    return handleResponse(res);
  },

  async updatePost(id, postData) {
    const res = await fetch(`${BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(postData)
    });
    return handleResponse(res);
  },

  async deletePost(id) {
    const res = await fetch(`${BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async toggleSupport(id) {
    const res = await fetch(`${BASE_URL}/posts/${id}/support`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async toggleSave(id) {
    const res = await fetch(`${BASE_URL}/posts/${id}/save`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async reportPost(id, reason) {
    const res = await fetch(`${BASE_URL}/posts/${id}/report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse(res);
  },

  async analyzePostAI(title, content) {
    const res = await fetch(`${BASE_URL}/posts/analyze-ai`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, content })
    });
    return handleResponse(res);
  }
};
export default postService;
