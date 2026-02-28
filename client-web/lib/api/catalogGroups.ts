import apiClient from './client'
import type {
  CatalogGroup,
  CreateCatalogGroupRequest,
  PaginatedResponse,
  ItemType,
} from './types'

export const catalogGroupsApi = {
  async getAll(params?: {
    page?: number
    limit?: number
    category_id?: number
    item_type?: ItemType
    is_official?: boolean
  }): Promise<PaginatedResponse<CatalogGroup>> {
    const response = await apiClient.get<PaginatedResponse<CatalogGroup>>(
      '/catalog-groups',
      { params }
    )
    return response.data
  },

  async getById(id: number): Promise<CatalogGroup> {
    const response = await apiClient.get<CatalogGroup>(`/catalog-groups/${id}`)
    return response.data
  },

  async create(data: CreateCatalogGroupRequest): Promise<CatalogGroup> {
    const response = await apiClient.post<CatalogGroup>('/catalog-groups', data)
    return response.data
  },

  async update(id: number, data: Partial<CreateCatalogGroupRequest>): Promise<CatalogGroup> {
    const response = await apiClient.put<CatalogGroup>(`/catalog-groups/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/catalog-groups/${id}`)
  },
}
