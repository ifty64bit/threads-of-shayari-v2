import type { APIType } from 'api';
import { hc } from 'hono/client';

const api = hc<APIType>('/', {
  headers: () => {
    const storedAuth = localStorage.getItem('auth');
    let token: string | undefined;

    try {
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        token = authData?.token;
      }
    } catch (error) {
      console.warn('Failed to parse auth from localStorage:', error);
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log(
        'Setting Authorization header:',
        `Bearer ${token.slice(0, 10)}...`
      );
    } else {
      console.log('No token found for Authorization header');
    }
    return headers;
  },
});

export default api.api;
