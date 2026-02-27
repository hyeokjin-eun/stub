import apiClient from './client'
import type { User, UserStats } from './types'

export const usersApi = {
  /**
   * Get all users (pagination)
   */
  async getAll(params?: {
    page?: number
    limit?: number
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const response = await apiClient.get<{
      data: User[]
      total: number
      page: number
      limit: number
    }>('/users', { params })
    return response.data
  },

  async getCount(): Promise<number> {
    const response = await apiClient.get<{ total: number }>('/users/count')
    return response.data.total
  },

  /**
   * Get user by ID
   */
  async getById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`)
    return response.data
  },

  /**
   * Update user profile
   */
  async update(
    id: number,
    data: {
      nickname?: string
      bio?: string
      avatar_url?: string
      phone?: string
      birth_date?: string
      onboarding_completed?: boolean
    }
  ): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, data)

    // Update stored user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
  },

  /**
   * Delete user account
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`)

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  },

  /**
   * Get user statistics
   */
  async getStats(id: number): Promise<UserStats> {
    const response = await apiClient.get<UserStats>(`/users/${id}/stats`)
    return response.data
  },
}
