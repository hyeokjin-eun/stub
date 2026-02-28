import axios, { AxiosInstance, AxiosError } from 'axios'
import { getSession } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

let pendingRequests = 0

function dispatchLoading(loading: boolean) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-loading', { detail: loading }))
  }
}

// Request interceptor - 세션 백엔드 토큰 우선, localStorage 폴백
apiClient.interceptors.request.use(
  async (config) => {
    pendingRequests++
    if (pendingRequests === 1) dispatchLoading(true)

    if (typeof window !== 'undefined') {
      // 1순위: NextAuth 세션의 백엔드 JWT
      const session = await getSession()
      const sessionToken = (session as any)?.backendToken

      // 2순위: 이메일/패스워드 로그인 시 localStorage에 저장된 토큰
      const localToken = localStorage.getItem('auth_token')

      const token = sessionToken || localToken
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        // 디버깅: 토큰이 없으면 콘솔에 경고
        if (session) {
          console.warn('[API Client] No token found. Session:', {
            hasSession: !!session,
            hasBackendToken: !!(session as any)?.backendToken,
            userId: (session as any)?.user?.id
          })
        }
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    pendingRequests = Math.max(0, pendingRequests - 1)
    if (pendingRequests === 0) dispatchLoading(false)
    return response
  },
  (error: AxiosError) => {
    pendingRequests = Math.max(0, pendingRequests - 1)
    if (pendingRequests === 0) dispatchLoading(false)

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
