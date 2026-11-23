import api from './axiosInstance'

const BASE = '/fuel-logs'

export const fuelLogsApi = {
  list:    (params)        => api.get(BASE, { params }),
  getById: (id)            => api.get(`${BASE}/${id}`),
  create:  (payload)       => api.post(BASE, payload),
  update:  (id, payload)   => api.put(`${BASE}/${id}`, payload),
  remove:  (id)            => api.delete(`${BASE}/${id}`),
}
