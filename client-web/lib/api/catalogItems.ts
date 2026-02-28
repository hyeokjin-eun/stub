import apiClient from './client'
import type {
  CatalogItem,
  CreateCatalogItemRequest,
  UpdateCatalogItemRequest,
  PaginatedResponse,
  ItemType,
  ItemStatus,
} from './types'

export const catalogItemsApi = {
  async getAll(params?: {
    page?: number
    limit?: number
    category_id?: number
    catalog_group_id?: number
    owner_id?: number
    item_type?: ItemType
    status?: ItemStatus
  }): Promise<PaginatedResponse<CatalogItem>> {
    const response = await apiClient.get<PaginatedResponse<CatalogItem>>(
      '/catalog-items',
      { params }
    )
    return response.data
  },

  async getById(id: number): Promise<CatalogItem> {
    const response = await apiClient.get<CatalogItem>(`/catalog-items/${id}`)
    return response.data
  },

  async create(data: CreateCatalogItemRequest): Promise<CatalogItem> {
    const response = await apiClient.post<CatalogItem>('/catalog-items', data)
    return response.data
  },

  async update(id: number, data: UpdateCatalogItemRequest): Promise<CatalogItem> {
    const response = await apiClient.put<CatalogItem>(`/catalog-items/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/catalog-items/${id}`)
  },
}
