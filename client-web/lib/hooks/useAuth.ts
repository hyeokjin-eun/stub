'use client'

import { useState, useEffect } from 'react'
import { authApi } from '../api'
import type { User, LoginRequest, SignupRequest } from '../api/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is authenticated on mount
  useEffect(() => {
    const storedUser = authApi.getStoredUser()
    if (storedUser && authApi.isAuthenticated()) {
      setUser(storedUser)
      // Optionally verify token with server
      authApi
        .getMe()
        .then((freshUser) => setUser(freshUser))
        .catch(() => authApi.logout())
    }
    setLoading(false)
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null)
      setLoading(true)
      const response = await authApi.login(credentials)
      setUser(response.user)
      return response
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || '로그인에 실패했습니다'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (data: SignupRequest) => {
    try {
      setError(null)
      setLoading(true)
      const newUser = await authApi.signup(data)
      // Automatically login after signup
      await login({ email: data.email, password: data.password })
      return newUser
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || '회원가입에 실패했습니다'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    setError(null)
  }

  const refreshUser = async () => {
    try {
      const freshUser = await authApi.getMe()
      setUser(freshUser)
      return freshUser
    } catch (err) {
      logout()
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
  }
}
