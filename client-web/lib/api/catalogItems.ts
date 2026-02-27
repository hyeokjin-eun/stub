import apiClient from './client'
import type {
  CatalogItem,
  CreateCatalogItemRequest,
  UpdateCatalogItemRequest,
  PaginatedResponse,
} from './types'

export const catalogItemsApi = {
  /**
   * Get all catalog items (tickets) with pagination
   */
  async getAll(params?: {
    page?: number
    limit?: number
    category_id?: number
    catalog_group_id?: number
    owner_id?: number
    status?: string
  }): Promise<PaginatedResponse<CatalogItem>> {
    const response = await apiClient.get<PaginatedResponse<CatalogItem>>(
      '/catalog-items',
      { params }
    )
    return response.data
  },

  /**
   * Get a single catalog item by ID
   */
  async getById(id: number): Promise<CatalogItem> {
    const response = await apiClient.get<CatalogItem>(`/catalog-items/${id}`)
    return response.data
  },

  /**
   * Create a new catalog item (ticket)
   */
  async create(data: CreateCatalogItemRequest): Promise<CatalogItem> {
    const response = await apiClient.post<CatalogItem>('/catalog-items', data)
    return response.data
  },

  /**
   * Update an existing catalog item
   */
  async update(
    id: number,
    data: UpdateCatalogItemRequest
  ): Promise<CatalogItem> {
    const response = await apiClient.put<CatalogItem>(
      `/catalog-items/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete a catalog item
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/catalog-items/${id}`)
  },
}
