/**
 * JPTL Unified API Service Layer
 * Interacts with the backend Express API using Bearer tokens and sessionStorage.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const tokenStorage = {
  getToken: () => {
    try {
      return sessionStorage.getItem('jptl_token');
    } catch {
      return null;
    }
  },
  setToken: (token) => {
    try {
      if (token) sessionStorage.setItem('jptl_token', token);
      else sessionStorage.removeItem('jptl_token');
    } catch (e) {
      console.error('Failed to write token to sessionStorage', e);
    }
  },
  getUser: () => {
    try {
      const raw = sessionStorage.getItem('jptl_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    try {
      if (user) sessionStorage.setItem('jptl_user', JSON.stringify(user));
      else sessionStorage.removeItem('jptl_user');
    } catch (e) {
      console.error('Failed to write user to sessionStorage', e);
    }
  },
  clearAuth: () => {
    try {
      sessionStorage.removeItem('jptl_token');
      sessionStorage.removeItem('jptl_user');
    } catch (e) {
      console.error('Failed to clear sessionStorage', e);
    }
  },
};

/**
 * Low-level HTTP client wrapper
 */
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = tokenStorage.getToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include', // Include cookies if present
    ...options,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  // If body is FormData, delete Content-Type so browser sets boundary automatically
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const res = await fetch(url, config);
    let data = null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { text };
    }

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || `Request failed with status ${res.status}`;
      const err = new Error(errorMessage);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    // If unauthorized / token expired, handle gracefully
    if (err.status === 401 && !endpoint.includes('/auth/login')) {
      tokenStorage.clearAuth();
    }
    throw err;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

/* -------------------------------------------------------------
 * Auth API
 * ------------------------------------------------------------- */
export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const token = res.token || res.data?.token;
    const user = res.data?.user || res.user;
    if (token) tokenStorage.setToken(token);
    if (user) tokenStorage.setUser(user);
    return { token, user, role: user?.role || res.role };
  },

  signup: async (data) => {
    return api.post('/auth/signup', data);
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    const user = res.data || res.user;
    if (user) tokenStorage.setUser(user);
    return user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      tokenStorage.clearAuth();
    }
  },

  updateProfile: async (data) => {
    const res = await api.patch('/auth/profile', data);
    const updated = res.data?.user || res.user || res.data;
    if (updated) tokenStorage.setUser(updated);
    return res;
  },

  changePassword: async (data) => {
    return api.patch('/auth/change-password', data);
  },
};

/* -------------------------------------------------------------
 * Landlord API
 * ------------------------------------------------------------- */
export const landlordApi = {
  getDashboard: () => api.get('/landlord/dash'),
  
  getProperties: () => api.get('/landlord/properties'),
  createProperty: (data) => api.post('/landlord/properties', data),
  updateProperty: (id, data) => api.put(`/landlord/properties/${id}`, data),
  deleteProperty: (id, force = false) => api.delete(`/landlord/properties/${id}${force ? '?force=true' : ''}`),
  
  createUnit: (propertyId, data) => api.post(`/landlord/properties/${propertyId}/units`, data),
  deleteUnit: (propertyId, unitId) => api.delete(`/landlord/properties/${propertyId}/units/${unitId}`),
  
  getTickets: () => api.get('/landlord/tickets'),
  createTicket: (data) => api.post('/landlord/tickets', data),
  updateTicketStatus: (id, status, notes) => api.patch(`/landlord/tickets/${id}/status`, { status, notes }),
  assignTechnician: (id, technicianData) => api.patch(`/landlord/tickets/${id}/assign`, technicianData),
  deleteTicket: (id) => api.delete(`/landlord/tickets/${id}`),

  getRentRoll: () => api.get('/landlord/rentroll'),
  
  getTenants: () => api.get('/landlord/tenantdirectory'),
  createTenant: (data) => api.post('/landlord/tenantdirectory', data),
  updateTenant: (id, data) => api.put(`/landlord/tenantdirectory/${id}`, data),
  deleteTenant: (id) => api.delete(`/landlord/tenantdirectory/${id}`),
  
  getDocuments: () => api.get('/landlord/documents'),
  publishPolicy: (data) => api.post('/landlord/documents/policy', data),
  updateDocumentStatus: (id, status, rejectionReason) => 
    api.patch(`/landlord/documents/${id}/status`, { status, rejectionReason }),

  getVendors: () => api.get('/landlord/vendors'),
  createVendor: (data) => api.post('/landlord/vendors', data),
  updateVendor: (id, data) => api.patch(`/landlord/vendors/${id}`, data),
  deleteVendor: (id) => api.delete(`/landlord/vendors/${id}`),

  getAuditLogs: () => api.get('/landlord/audit-logs'),

  getAnnouncements: () => api.get('/landlord/announcements'),
  createAnnouncement: (data) => api.post('/landlord/announcements', data),

  getOnboardingStatus: () => api.get('/landlord/onboarding/status'),
  completeOnboarding: (data) => api.post('/landlord/onboarding/complete', data),
};

/* -------------------------------------------------------------
 * Tenant API
 * ------------------------------------------------------------- */
export const tenantApi = {
  getDashboard: () => api.get('/tenant/dash'),
  
  getLease: () => api.get('/tenant/lease'),

  getPayments: () => api.get('/tenant/payments'),
  payRent: (data) => api.post('/tenant/payments/pay', data),
  getPaymentMethods: () => api.get('/tenant/payments/methods'),
  addPaymentMethod: (data) => api.post('/tenant/payments/methods', data),
  deletePaymentMethod: (id) => api.delete(`/tenant/payments/methods/${id}`),
  toggleAutoPay: (autoPay) => api.patch('/tenant/payments/autopay', { autoPay }),
  getReceipt: (id) => api.get(`/tenant/payments/${id}/receipt`),

  getTickets: () => api.get('/tenant/tickets'),
  createTicket: (data) => api.post('/tenant/tickets', data),
  cancelTicket: (id) => api.patch(`/tenant/tickets/${id}/cancel`),
  addTicketComment: (id, text) => api.post(`/tenant/tickets/${id}/comments`, { text }),

  getDocuments: () => api.get('/tenant/documents'),
  uploadDocument: (data) => api.post('/tenant/documents', data),

  getVehicles: () => api.get('/tenant/vehicles'),
  addVehicle: (data) => api.post('/tenant/vehicles', data),
  deleteVehicle: (id) => api.delete(`/tenant/vehicles/${id}`),

  getAnnouncements: () => api.get('/tenant/announcements'),
};

/* -------------------------------------------------------------
 * Notification API
 * ------------------------------------------------------------- */
export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  getVapidKey: () => api.get('/notifications/vapid-key'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  subscribePush: (subscription) => api.post('/notifications/subscribe', { subscription }),
};
