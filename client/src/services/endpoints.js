import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const projectService = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
  changeMemberRole: (id, userId, data) => api.put(`/projects/${id}/members/${userId}/role`, data),
};

export const taskService = {
  getAll: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  getOne: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  updateStatus: (projectId, taskId, data) => api.patch(`/projects/${projectId}/tasks/${taskId}/status`, data),
  assign: (projectId, taskId, data) => api.patch(`/projects/${projectId}/tasks/${taskId}/assign`, data),
  delete: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  searchUsers: (email) => api.get(`/users/search?email=${email}`),
};
