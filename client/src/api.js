import axios from 'axios';

const raw = (import.meta.env.VITE_API_URL || '/api').trim();
// Normalize: allow users to set VITE_API_URL to either
//   https://backend.onrender.com/api  (correct)
// or https://backend.onrender.com      (missing /api — auto-fix)
// Vite bakes this at build time, so a wrong value breaks deploys
// with "Cannot POST /leads".
function normalizeBase(v) {
  const noSlash = v.replace(/\/$/, '');
  if (noSlash === '/api' || noSlash.endsWith('/api')) return noSlash;
  // If it's an absolute URL without /api suffix, append it.
  if (/^https?:\/\//i.test(noSlash)) return `${noSlash}/api`;
  return noSlash;
}
const normalized = normalizeBase(raw);

const api = axios.create({
  baseURL: normalized,
  timeout: 30000
});

export const fetchRestaurants = (params = {}) => api.get('/restaurants', { params }).then(r => r.data);
export const createRestaurant = (payload) => api.post('/restaurants', payload).then(r => r.data);
export const fetchTab = (tabId = '8492') => api.get(`/orders/${tabId}`).then(r => r.data);
export const addToTab = (tabId, payload) => api.post(`/orders/${tabId}/add`, payload).then(r => r.data);
export const notifyServer = () => api.post('/orders/service-call/notify', {}).then(r => r.data);
export const submitLead = (payload) => api.post('/leads', payload).then(r => r.data);
export const createReservation = (payload) => api.post('/reservations', payload).then(r => r.data);

export default api;
