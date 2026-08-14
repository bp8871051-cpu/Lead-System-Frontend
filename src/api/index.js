import client from './client';

export const authApi = {
  login: (credentials) => client.post('/auth/login', credentials),
  register: (data) => client.post('/auth/register', data),
  logout: () => client.post('/auth/logout'),
  me: () => client.get('/auth/me'),
  updateProfile: (data) => client.put('/auth/profile', data),
  changePassword: (data) => client.put('/auth/password', data),
};

export const companyApi = {
  getProfile: () => client.get('/company-profile'),
  updateProfile: (data) => client.put('/company-profile', data),
};

export const dashboardApi = {
  getStats: () => client.get('/dashboard/stats'),
};

export const leadApi = {
  getLeads: (params) => client.get('/leads', { params }),
  getLead: (id) => client.get(`/leads/${id}`),
  createLead: (data) => client.post('/leads', data),
  updateLead: (id, data) => client.put(`/leads/${id}`, data),
  deleteLead: (id) => client.delete(`/leads/${id}`),
  bulkDelete: (leadIds) => client.post('/leads/bulk-delete', { lead_ids: leadIds }),
  enrichEmail: (id) => client.post(`/leads/${id}/enrich-email`),
  bulkEnrichEmails: (leadIds) => client.post('/leads/bulk-enrich-emails', { lead_ids: leadIds }),
  getTrash: (params) => client.get('/leads/trash', { params }),
  restoreLead: (id) => client.post(`/leads/${id}/restore`),
  forceDeleteLead: (id) => client.delete(`/leads/${id}/force`),
  addNote: (id, note) => client.post(`/leads/${id}/notes`, { note }),
};

export const scrapingApi = {
  startScraping: (criteria) => client.post('/scraping/start', criteria),
  getJobs: () => client.get('/scraping/jobs'),
  getJob: (id) => client.get(`/scraping/jobs/${id}`),
};

export const emailApi = {
  generateEmail: (data) => client.post('/emails/generate', data),
  renderEmail: (data) => client.post('/emails/render', data),
  sendEmail: (data) => client.post('/emails/send', data),
  bulkSendEmail: (data) => client.post('/emails/bulk-send', data),
  getLogs: (params) => client.get('/emails/logs', { params }),
  getTemplates: () => client.get('/email-templates'),
  createTemplate: (data) => client.post('/email-templates', data),
  updateTemplate: (id, data) => client.put(`/email-templates/${id}`, data),
  deleteTemplate: (id) => client.delete(`/email-templates/${id}`),
};

export const campaignApi = {
  getCampaigns: () => client.get('/campaigns'),
  getCampaign: (id) => client.get(`/campaigns/${id}`),
  createCampaign: (data) => client.post('/campaigns', data),
  startCampaign: (id) => client.post(`/campaigns/${id}/start`),
  pauseCampaign: (id) => client.post(`/campaigns/${id}/pause`),
  deleteCampaign: (id) => client.delete(`/campaigns/${id}`),
};

export const importExportApi = {
  previewImport: (formData) => client.post('/import/preview', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  processImport: (formData) => client.post('/import/process', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  exportLeads: (type, params = {}) => client.get('/export', { params: { type, ...params }, responseType: 'blob' }),
};

export const settingsApi = {
  getSettings: () => client.get('/settings'),
  updateSettings: (data) => client.put('/settings', data),
  testEmail: (data) => client.post('/settings/test-email', data),
};
