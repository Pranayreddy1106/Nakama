let detectedUrl = '/api';
if (typeof window !== 'undefined' && window.location && window.location.hostname) {
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    detectedUrl = 'https://nakama-backend-3wci.onrender.com/api';
  }
}

export const BASE_URL = import.meta.env.VITE_API_URL || detectedUrl;
console.log('[API_CLIENT] Using API Base URL:', BASE_URL);

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
  let data;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      const text = await res.text();
      data = { message: text || `HTTP error ${res.status}: ${res.statusText}` };
    }
  } else {
    try {
      const text = await res.text();
      data = { message: text || `HTTP error ${res.status}: ${res.statusText}` };
    } catch (e) {
      data = { message: `HTTP error ${res.status}: ${res.statusText}` };
    }
  }

  if (!res.ok) {
    throw new Error(data.message || 'Operation failed');
  }
  return data;
}
