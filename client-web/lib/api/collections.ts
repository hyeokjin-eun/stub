import apiClient from './client'
import type { Collection } from './types'

export const collectionsApi = {
  async getMine(): Promise<Collection[]> {
    const res = await apiClient.get<Collection[]>('/collections/me')
    return res.data
  },

  async getPublic(): Promise<Collection[]> {
    const res = await apiClient.get<Collection[]>('/collections/public/all')
    return res.data
  },

  async getOne(id: number): Promise<Collection> {
    const res = await apiClient.get<Collection>(`/collections/${id}`)
    return res.data
  },

  async create(data: { name: string; description?: string; is_public?: boolean }): Promise<Collection> {
    const res = await apiClient.post<Collection>('/collections', data)
    return res.data
  },

  async update(id: number, data: { name?: string; description?: string; is_public?: boolean }): Promise<Collection> {
    const res = await apiClient.patch<Collection>(`/collections/${id}`, data)
    return res.data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/collections/${id}`)
  },

  async addItem(collectionId: number, catalogItemId: number, stubId?: number): Promise<void> {
    await apiClient.post(`/collections/${collectionId}/items`, {
      catalog_item_id: catalogItemId,
      stub_id: stubId,
    })
  },

  async removeItem(collectionId: number, catalogItemId: number): Promise<void> {
    await apiClient.delete(`/collections/${collectionId}/items/${catalogItemId}`)
  },
}
