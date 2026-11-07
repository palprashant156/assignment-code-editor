import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '', withCredentials: true, headers: { 'Content-Type': 'application/json' } });
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.dispatchEvent(new CustomEvent('codearena:unauthorized'));
  }
  return Promise.reject(error);
});
export const messageOf = (error: any) => error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
