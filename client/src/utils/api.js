// Creates a pre-configured Axios instance so every page can call `api.get/post/...`
// without repeating the base URL or headers.

import axios from 'axios';

const api = axios.create({
  baseURL: (() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    // Ensure there is exactly one trailing /api on the URL.
    return base.replace(/\/$/, '') + '/api';
  })(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
