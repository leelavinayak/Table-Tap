import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
