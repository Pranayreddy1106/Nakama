export const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Operation failed');
  }
  return data;
}
