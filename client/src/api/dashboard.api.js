import api from './axiosInstance'

export const getKpis = (params) => api.get('/dashboard/kpis', { params })
export const getAnalyticsCharts = (params) => api.get('/dashboard/charts', { params })

export const dashboardApi = {
  getKpis,
  getAnalyticsCharts,
}
