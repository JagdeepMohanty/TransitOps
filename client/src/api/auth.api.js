import axiosInstance from './axiosInstance'

export const login = (email, password) =>
  axiosInstance.post('/auth/login', { email, password })

export const register = (data) =>
  axiosInstance.post('/auth/register', data)

export const getCurrentUser = () =>
  axiosInstance.get('/auth/me')

export const logout = () =>
  axiosInstance.post('/auth/logout').catch(() => {})
