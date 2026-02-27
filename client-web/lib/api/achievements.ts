import apiClient from './client'
import type { Achievement } from './types'

export const achievementsApi = {
  /**
   * Get all available achievements
   */
  async getAll(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>('/achievements')
    return response.data
  },

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>(
      `/achievements/users/${userId}`
    )
    return response.data
  },

  /**
   * Get user's achievement stats
   */
  async getUserAchievementStats(
    userId: number
  ): Promise<{ total: number; achieved: number; progress: number }> {
    const response = await apiClient.get<{
      total: number
      achieved: number
      progress: number
    }>(`/achievements/users/${userId}/stats`)
    return response.data
  },
}
