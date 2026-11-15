import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration or unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // only redirect if in protected route
      if (!window.location.pathname.startsWith('/projects') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth API
export const authApi = {
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Projects API
export const projectsApi = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getClientProjects: (params) => api.get('/projects/client/my-projects', { params }),
  getSmartMatches: (id) => api.get(`/projects/${id}/smart-matches`),
};

// Proposals API
export const proposalsApi = {
  submit: (data) => api.post('/proposals', data),
  getFreelancerProposals: () => api.get('/proposals/my-proposals'),
  getProjectProposals: (projectId) => api.get(`/proposals/project/${projectId}`),
  accept: (id) => api.post(`/proposals/${id}/accept`),
  reject: (id) => api.post(`/proposals/${id}/reject`),
};

// Contracts & Milestones API
export const contractsApi = {
  getById: (id) => api.get(`/contracts/${id}`),
  getUserContracts: () => api.get('/contracts/my-contracts'),
  complete: (id) => api.post(`/contracts/${id}/complete`),
  createMilestone: (contractId, data) => api.post(`/milestones/contract/${contractId}`, data),
  fundEscrow: (id) => api.post(`/milestones/${id}/fund-escrow`),
  submitWork: (id, data) => api.post(`/milestones/${id}/submit-work`, data),
  approveMilestone: (id) => api.post(`/milestones/${id}/approve`),
  rejectMilestone: (id, data) => api.post(`/milestones/${id}/reject`, data),
  releasePayment: (id) => api.post(`/milestones/${id}/release-payment`),
};

// Payments & Wallets API
export const paymentsApi = {
  getWallet: () => api.get('/payments/wallet'),
  deposit: (data) => api.post('/payments/deposit', data),
  withdraw: (data) => api.post('/payments/withdraw', data),
};

// Reviews API
export const reviewsApi = {
  create: (data) => api.post('/reviews', data),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
};

// Admin API
export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  suspendUser: (id, data) => api.post(`/admin/users/${id}/suspend`, data),
  activateUser: (id) => api.post(`/admin/users/${id}/activate`),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  getSkills: () => api.get('/admin/skills'),
  createSkill: (data) => api.post('/admin/skills', data),
  getProjects: (params) => api.get('/admin/projects', { params }),
  updateProjectStatus: (id, data) => api.put(`/admin/projects/${id}/status`, data),
};

// Upload API
export const uploadApi = {
  uploadAttachment: (projectId, formData) =>
    api.post(`/upload/attachment/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAttachments: (projectId) => api.get(`/upload/attachment/${projectId}`),
  uploadAvatar: (formData) =>
    api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};


// Analytics API
export const analyticsApi = {
  getAdminAnalytics: () => api.get('/analytics/admin'),
  getClientStats: () => api.get('/analytics/client'),
  getFreelancerStats: () => api.get('/analytics/freelancer'),
  refreshMaterializedViews: () => api.post('/analytics/refresh-views'),
};

// Metadata API
export const metaApi = {
  getCategories: () => api.get('/users/meta/categories'),
  getSkills: () => api.get('/users/meta/skills'),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationAsRead: (id) => api.put(`/users/notifications/${id}/read`),
  updateProfile: (data) => api.put('/users/profile', data),
};

export default api;
