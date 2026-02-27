import apiClient from './client'
import type { Category } from './types'

export const categoriesApi = {
  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories')
    return response.data
  },

  /**
   * Get category by ID
   */
  async getById(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${id}`)
    return response.data
  },

  /**
   * Get category by code
   */
  async getByCode(code: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/code/${code}`)
    return response.data
  },
}
