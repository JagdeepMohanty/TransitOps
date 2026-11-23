import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import * as authApi from '@/api/auth.api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'transitops_token'
const USER_KEY  = 'transitops_user'

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (arg1, arg2) => {
    // If called in legacy mode (userData, token)
    if (typeof arg1 === 'object' && arg1 !== null && typeof arg2 === 'string' && !arg1.email) {
      localStorage.setItem(TOKEN_KEY, arg2)
      localStorage.setItem(USER_KEY, JSON.stringify(arg1))
      setUserState(arg1)
      return arg1
    }

    const email = typeof arg1 === 'object' && arg1 !== null ? arg1.email : arg1
    const password = typeof arg1 === 'object' && arg1 !== null ? arg1.password : arg2

    setIsLoading(true)
    try {
      const res = await authApi.login(email, password)
      const { token, user: userData } = res.data.data
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      setUserState(userData)
      return userData
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setUserState(null)
    }
  }, [])

  const register = useCallback(async (formData) => {
    setIsLoading(true)
    try {
      const res = await authApi.register(formData)
      return res.data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const hasRole = useCallback((roles) => {
    if (!user) return false
    const allowed = Array.isArray(roles) ? roles : [roles]
    const roleName = typeof user.role === 'object' ? user.role?.name : user.role
    return allowed.includes(roleName)
  }, [user])

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    hasRole,
  }), [user, isLoading, login, logout, register, hasRole])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
