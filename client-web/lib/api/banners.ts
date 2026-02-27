import apiClient from './client'
import type { Banner } from './types'

export const bannersApi = {
  /**
   * Get all active banners
   */
  async getAll(): Promise<Banner[]> {
    const response = await apiClient.get<Banner[]>('/banners')
    return response.data
  },
}
