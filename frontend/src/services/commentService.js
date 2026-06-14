import { BASE_URL, getHeaders, handleResponse } from './apiClient.js';

export const commentService = {
  async getCommentsByPost(postId) {
    const res = await fetch(`${BASE_URL}/comments/post/${postId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createComment(postId, content) {
    const res = await fetch(`${BASE_URL}/comments/post/${postId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    });
    return handleResponse(res);
  },

  async replyToComment(commentId, content) {
    const res = await fetch(`${BASE_URL}/comments/${commentId}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    });
    return handleResponse(res);
  },

  async deleteComment(id) {
    const res = await fetch(`${BASE_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
export default commentService;
