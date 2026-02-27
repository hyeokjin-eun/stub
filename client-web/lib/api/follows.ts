import apiClient from './client'
import type { User } from './types'

export const followsApi = {
  /**
   * Toggle follow on a user
   */
  async toggle(
    userId: number
  ): Promise<{ following: boolean; message: string }> {
    const response = await apiClient.post<{
      following: boolean
      message: string
    }>(`/follows/toggle/${userId}`)
    return response.data
  },

  /**
   * Get user's followers
   */
  async getFollowers(userId: number): Promise<User[]> {
    const response = await apiClient.get<{ data: User[] }>(`/follows/followers/${userId}`)
    return response.data.data
  },

  /**
   * Get users that user is following
   */
  async getFollowing(userId: number): Promise<User[]> {
    const response = await apiClient.get<{ data: User[] }>(`/follows/following/${userId}`)
    return response.data.data
  },

  /**
   * Check if current user is following another user
   */
  async checkFollow(userId: number): Promise<{ following: boolean }> {
    const response = await apiClient.get<{ following: boolean }>(
      `/follows/check/${userId}`
    )
    return response.data
  },
}
