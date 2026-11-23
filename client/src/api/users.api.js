import api from './axiosInstance'

const BASE = '/users'

export const usersApi = {
  list:       (params)        => api.get(BASE, { params }),
  getById:    (id)            => api.get(`${BASE}/${id}`),
  getRoles:   ()              => api.get(`${BASE}/roles`),
  create:     (payload)       => api.post(BASE, payload),
  update:     (id, payload)   => api.put(`${BASE}/${id}`, payload),
  remove:     (id)            => api.delete(`${BASE}/${id}`),
  approve:    (id, payload)   => api.post(`${BASE}/${id}/approve`, payload),
  reject:     (id, payload)   => api.post(`${BASE}/${id}/reject`, payload),
  updateRole: (id, payload)   => api.put(`${BASE}/${id}/role`, payload),
}
