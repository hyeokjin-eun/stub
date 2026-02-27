import apiClient from './client'
import type { SignupRequest, LoginRequest, LoginResponse, User } from './types'

export const authApi = {
  /**
   * Sign up a new user
   */
  async signup(data: SignupRequest): Promise<User> {
    const response = await apiClient.post<User>('/auth/signup', data)
    return response.data
  },

  /**
   * Login user and get JWT token
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)

    // Store token and user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  /**
   * Logout user
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token')
    }
    return false
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch {
          return null
        }
      }
    }
    return null
  },
}
