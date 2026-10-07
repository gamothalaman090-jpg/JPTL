/**
 * JPTL Unified API Service Layer
 * Interacts with the backend Express API using Bearer tokens and sessionStorage.
 */

import { fetchConcurrent } from './workerClient';

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
      if (res.status === 503) {
        window.dispatchEvent(
          new CustomEvent('jptl-maintenance-active', {
            detail: { message: data?.message || 'Platform is currently undergoing scheduled maintenance.' },
          })
        );
      }
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

export const systemApi = {
  getStatus: () => request('/system/status'),
};


export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

const complianceStreamApi = {
  async streamComplianceReminders({ signal, onReminder }) {
    const token = tokenStorage.getToken();
    const response = await fetch(`${API_BASE_URL}/notifications/stream`, {
      headers: token ? { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' } : { Accept: 'text/event-stream' },
      credentials: 'include',
      signal,
    });
    if (!response.ok || !response.body) throw new Error('Could not connect to compliance reminders.');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (!signal?.aborted) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() || '';
      for (const block of blocks) {
        if (!block.includes('event: compliance-expiration-reminder')) continue;
        const data = block.split('\n').find((line) => line.startsWith('data:'))?.slice(5).trim();
        if (!data) continue;
        try { onReminder?.(JSON.parse(data)); } catch { /* Ignore malformed stream events. */ }
      }
    }
  },
};

/* -------------------------------------------------------------
 * Auth API
 * ------------------------------------------------------------- */
export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const token = res.token || res.data?.token;
    const user = res.user || res.data?.user || (res.role ? { role: res.role, email: credentials.email } : null);
    if (token) tokenStorage.setToken(token);
    if (user) tokenStorage.setUser(user);
    return { token, user, role: user?.role || res.role };
  },

  signup: async (data) => {
    return api.post('/auth/signup', data);
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    const user = res.user || res.data?.user || res.data;
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

  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (token, newPassword) =>
    request('/auth/reset-password', { method: 'POST', body: { token, newPassword } }),

  updateProfile: async (data) => {
    const res = await api.patch('/auth/profile', data);
    const updated = res.data?.user || res.user || res.data;
    if (updated) tokenStorage.setUser(updated);
    return res;
  },

  changePassword: async (data) => {
    return api.patch('/auth/change-password', data);
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await request('/auth/avatar', {
      method: 'POST',
      body: formData,
    });
    const updated = res.user || res.data?.user;
    if (updated) tokenStorage.setUser(updated);
    return res;
  },

  removeAvatar: async () => {
    const res = await request('/auth/avatar', {
      method: 'DELETE',
    });
    const updated = res.user || res.data?.user;
    if (updated) tokenStorage.setUser(updated);
    return res;
  },
};

// In-flight prefetch promise store to deduplicate across login/navigation
const inFlightPrefetches = new Map();

export const prefetchStore = {
  fetch: (key, fetcher) => {
    if (!inFlightPrefetches.has(key)) {
      const p = fetcher().catch((err) => {
        inFlightPrefetches.delete(key);
        throw err;
      });
      inFlightPrefetches.set(key, p);
    }
    return inFlightPrefetches.get(key);
  },
  get: (key) => inFlightPrefetches.get(key) || null,
  clear: (key) => inFlightPrefetches.delete(key),
};

/* -------------------------------------------------------------
 * Landlord API
 * ------------------------------------------------------------- */
export const landlordApi = {
  getDashboard: () => api.get('/landlord/dash'),
  
  /** Singular consolidated endpoint – 1 HTTP call for all dashboard data */
  getDashInit: () => {
    const existing = prefetchStore.get('landlord_dash_init');
    if (existing) {
      prefetchStore.clear('landlord_dash_init');
      return existing;
    }
    return api.get('/landlord/dash/init');
  },

  /** Prefetches landlord dashboard data during login transition */
  prefetchDashInit: () => {
    return prefetchStore.fetch('landlord_dash_init', () => api.get('/landlord/dash/init'));
  },
  
  getProperties: () => api.get('/landlord/properties'),
  createProperty: (data) => api.post('/landlord/properties', data),
  updateProperty: (id, data) => api.put(`/landlord/properties/${id}`, data),
  deleteProperty: (id, force = false) => api.delete(`/landlord/properties/${id}${force ? '?force=true' : ''}`),
  
  createUnit: (propertyId, data) => api.post(`/landlord/properties/${propertyId}/units`, data),
  deleteUnit: (propertyId, unitId) => api.delete(`/landlord/properties/${propertyId}/units/${unitId}`),
  
  getTickets: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/landlord/tickets${qs ? '?' + qs : ''}`);
  },
  uploadTicketPhotos: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('photos', file));
    const token = tokenStorage.getToken();
    const res = await fetch(`${API_BASE_URL}/landlord/tickets/upload-photos`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Photo upload failed');
    return data; // { success: true, photoUrls: [...] }
  },
  createTicket: (data) => api.post('/landlord/tickets', data),
  updateTicketStatus: (id, status, notes) => api.patch(`/landlord/tickets/${id}/status`, { status, notes }),
  assignTechnician: (id, technicianData) => api.patch(`/landlord/tickets/${id}/assign`, technicianData),
  deleteTicket: (id) => api.delete(`/landlord/tickets/${id}`),

  getRentRoll: () => api.get('/landlord/rentroll'),
  getPaymentOptions: () => api.get('/landlord/payment-options'),
  createPaymentOption: (formData) => api.post('/landlord/payment-options', formData),
  updatePaymentOption: (id, formData) => api.put(`/landlord/payment-options/${id}`, formData),
  setPaymentOptionActive: (id, isActive) => api.patch(`/landlord/payment-options/${id}/active`, { isActive }),
  reviewPayment: (id, data) => api.patch(`/landlord/rentroll/${id}/review`, data),
  getPaymentEvidence: async (id) => {
    const token = tokenStorage.getToken();
    const res = await fetch(`${API_BASE_URL}/landlord/rentroll/${id}/evidence`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: 'include' });
    if (!res.ok) throw new Error('Could not load payment receipt');
    return res.blob();
  },
  
  getTenants: () => api.get('/landlord/tenantdirectory'),
  getStaff: () => api.get('/landlord/staff'),
  inviteStaff: (data) => api.post('/landlord/staff', data),
  deactivateStaff: (id) => api.delete(`/landlord/staff/${id}`),
  createTenant: (data) => api.post('/landlord/tenantdirectory', data),
  updateTenant: (id, data) => api.put(`/landlord/tenantdirectory/${id}`, data),
  deleteTenant: (id) => api.delete(`/landlord/tenantdirectory/${id}`),
  
  getDocuments: () => api.get('/landlord/documents'),
  getComplianceReminderSettings: () => api.get('/landlord/documents/reminder-settings'),
  updateComplianceReminderSettings: (noticeLeadTimeDays) => api.patch('/landlord/documents/reminder-settings', { noticeLeadTimeDays }),
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
  deleteAnnouncement: (id) => api.delete(`/landlord/announcements/${id}`),

  getOnboardingStatus: () => api.get('/landlord/onboarding/status'),
  completeOnboarding: (data) => api.post('/landlord/onboarding/complete', data),

  // Lease Extensions
  getLeaseExtensions: (status = 'all') => api.get(`/landlord/lease-extensions?status=${status}`),
  reviewLeaseExtension: (leaseId, extensionId, data) =>
    api.patch(`/landlord/lease-extensions/${leaseId}/${extensionId}`, data),
  getManagedLeases: () => api.get('/landlord/lease/extensions'),
  reviewEarlyLeaseEnd: (leaseId, requestId, data) => api.patch(`/landlord/lease/${leaseId}/termination-requests/${requestId}/review`, data),
  getEvictionNotices: () => api.get('/landlord/eviction-notices'),
  issueEvictionNotice: (data) => api.post('/landlord/eviction-notices', data),
  cancelEvictionNotice: (noticeId, reason = '') => api.patch(`/landlord/eviction-notices/${noticeId}/cancel`, { reason }),
  deleteCanceledEvictionNotice: (noticeId) => api.delete(`/landlord/eviction-notices/${noticeId}`),
  evictOverride: (leaseId, reason) => api.post(`/landlord/eviction-notices/${leaseId}/override`, { reason }),

  getConcurrentDashboardData: () => {
    return fetchConcurrent([
      { key: 'dash', endpoint: '/landlord/dash' },
      { key: 'properties', endpoint: '/landlord/properties' },
      { key: 'tickets', endpoint: '/landlord/tickets' },
      { key: 'tenants', endpoint: '/landlord/tenantdirectory' },
      { key: 'documents', endpoint: '/landlord/documents' },
      { key: 'rentroll', endpoint: '/landlord/rentroll' },
      { key: 'announcements', endpoint: '/landlord/announcements' },
    ]);
  },
};

/* -------------------------------------------------------------
 * Tenant API
 * ------------------------------------------------------------- */
export const tenantApi = {
  getDashboard: () => api.get('/tenant/dash'),
  
  getLease: () => api.get('/tenant/lease'),
  requestEarlyLeaseEnd: (data) => api.post('/tenant/lease/end-early', data),
  getEvictionNotices: () => api.get('/tenant/eviction-notices'),

  getPayments: () => api.get('/tenant/payments'),
  getPaymentOptions: () => api.get('/tenant/payments/options'),
  getOrCreateCurrentRentInvoice: () => api.post('/tenant/payments/current-invoice', {}),
  createAdvanceRentInvoice: (monthsAhead) => api.post('/tenant/payments/advance-invoice', { monthsAhead }),
  discardAdvanceRentDraft: (id) => api.delete(`/tenant/payments/${id}/advance-draft`),
  submitPaymentEvidence: (id, formData) => api.post(`/tenant/payments/${id}/submit`, formData),
  submitOnsitePayment: (id, data) => api.post(`/tenant/payments/${id}/pay-onsite`, data),
  payRent: (data) => api.post('/tenant/payments/pay', data),
  payInAdvance: (data) => api.post('/tenant/payments/pay-advance', data),
  getPaymentMethods: () => api.get('/tenant/payments/methods'),
  addPaymentMethod: (data) => api.post('/tenant/payments/methods', data),
  deletePaymentMethod: (id) => api.delete(`/tenant/payments/methods/${id}`),
  toggleAutoPay: (autoPay) => api.patch('/tenant/payments/autopay', { autoPay }),
  getReceipt: (id) => api.get(`/tenant/payments/${id}/receipt`),

  requestLeaseExtension: (data) => api.post('/tenant/lease/extension', data),
  getLeaseDocument: () => api.get('/tenant/lease/document'),

  getTickets: () => api.get('/tenant/tickets'),
  createTicket: (data) => api.post('/tenant/tickets', data),
  deleteTicket: (id) => api.delete(`/tenant/tickets/${id}`),
  uploadPhotos: async (files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('photos', f));
    const token = tokenStorage.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE_URL}/tenant/tickets/upload-photos`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Photo upload failed');
    return data;
  },
  cancelTicket: (id) => api.patch(`/tenant/tickets/${id}/cancel`),
  addTicketComment: (id, text) => api.post(`/tenant/tickets/${id}/comments`, { text }),

  getDocuments: () => api.get('/tenant/documents'),
  uploadDocument: (data) => api.post('/tenant/documents', data),

  getVehicles: () => api.get('/tenant/vehicles'),
  addVehicle: (data) => api.post('/tenant/vehicles', data),
  deleteVehicle: (id) => api.delete(`/tenant/vehicles/${id}`),

  getAnnouncements: () => api.get('/tenant/announcements'),

  /** Singular consolidated endpoint – 1 HTTP call for all portal data */
  getPortalInit: () => {
    const existing = prefetchStore.get('tenant_portal_init');
    if (existing) {
      prefetchStore.clear('tenant_portal_init');
      return existing;
    }
    return api.get('/tenant/dash/init');
  },

  /** Prefetches tenant portal data during login transition */
  prefetchPortalInit: () => {
    return prefetchStore.fetch('tenant_portal_init', () => api.get('/tenant/dash/init'));
  },

  getConcurrentPortalData: () => {
    return fetchConcurrent([
      { key: 'dash', endpoint: '/tenant/dash' },
      { key: 'payments', endpoint: '/tenant/payments' },
      { key: 'tickets', endpoint: '/tenant/tickets' },
      { key: 'announcements', endpoint: '/tenant/announcements' },
      { key: 'lease', endpoint: '/tenant/lease' },
    ]);
  },
};

export { fetchConcurrent };

/* -------------------------------------------------------------
 * Notification API
 * ------------------------------------------------------------- */
export const notificationApi = {
  ...complianceStreamApi,
  getNotifications: () => api.get('/notifications'),
  getVapidKey: () => api.get('/notifications/vapid-key'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  clearAll: () => api.delete('/notifications/clear-all'),
  subscribePush: (subscription) => api.post('/notifications/subscribe', { subscription }),
};

export const staffApi = {
  getDashboard: () => api.get('/staff/dashboard'),
};
