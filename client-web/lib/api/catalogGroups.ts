import apiClient from './client'
import type {
  CatalogGroup,
  CreateCatalogGroupRequest,
  PaginatedResponse,
} from './types'

export const catalogGroupsApi = {
  /**
   * Get all catalog groups with pagination
   */
  async getAll(params?: {
    page?: number
    limit?: number
    category_id?: number
    creator_id?: number
    is_official?: boolean
  }): Promise<PaginatedResponse<CatalogGroup>> {
    const response = await apiClient.get<PaginatedResponse<CatalogGroup>>(
      '/catalog-groups',
      { params }
    )
    return response.data
  },

  /**
   * Get a single catalog group by ID
   */
  async getById(id: number): Promise<CatalogGroup> {
    const response = await apiClient.get<CatalogGroup>(`/catalog-groups/${id}`)
    return response.data
  },

  /**
   * Create a new catalog group
   */
  async create(data: CreateCatalogGroupRequest): Promise<CatalogGroup> {
    const response = await apiClient.post<CatalogGroup>(
      '/catalog-groups',
      data
    )
    return response.data
  },

  /**
   * Update an existing catalog group
   */
  async update(
    id: number,
    data: Partial<CreateCatalogGroupRequest>
  ): Promise<CatalogGroup> {
    const response = await apiClient.put<CatalogGroup>(
      `/catalog-groups/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete a catalog group
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/catalog-groups/${id}`)
  },
}
