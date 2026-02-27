import apiClient from './client'
import type { CatalogItem } from './types'

export const likesApi = {
  /**
   * Toggle like on a catalog item
   */
  async toggle(itemId: number): Promise<{ liked: boolean; message: string }> {
    const response = await apiClient.post<{ liked: boolean; message: string }>(
      `/likes/toggle/${itemId}`
    )
    return response.data
  },

  /**
   * Get user's liked items
   */
  async getMyLikes(): Promise<CatalogItem[]> {
    const response = await apiClient.get<{ data: CatalogItem[] }>('/likes/my')
    return response.data.data
  },

  /**
   * Check if user has liked an item
   */
  async checkLike(itemId: number): Promise<{ liked: boolean }> {
    const response = await apiClient.get<{ liked: boolean }>(
      `/likes/check/${itemId}`
    )
    return response.data
  },
}
