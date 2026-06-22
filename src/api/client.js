const API_BASE = 'http://localhost:3001';

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getEvents: () => request('/events'),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id, data) => request(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getBookings: (userId) => request(`/bookings?userId=${userId}`),
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  cancelBooking: (id, data) => request(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getUser: (id) => request(`/users/${id}`),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getReviews: (eventId) => request(`/reviews?eventId=${eventId}`),
  getRecommendations: (eventId) => request(`/recommendations?eventId=${eventId}`),
};

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
