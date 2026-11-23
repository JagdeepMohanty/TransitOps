import api from './axiosInstance'

const BASE = '/expenses'

export const expensesApi = {
  list:    (params)        => api.get(BASE, { params }),
  getById: (id)            => api.get(`${BASE}/${id}`),
  create:  (payload)       => api.post(BASE, payload),
  update:  (id, payload)   => api.put(`${BASE}/${id}`, payload),
  remove:  (id)            => api.delete(`${BASE}/${id}`),
}
