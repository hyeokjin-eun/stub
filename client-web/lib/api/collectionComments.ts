import apiClient from './client'
import type { CollectionComment } from './types'

export const collectionCommentsApi = {
  async getByCollection(collectionId: number): Promise<CollectionComment[]> {
    const res = await apiClient.get<CollectionComment[]>(`/collection-comments/collection/${collectionId}`)
    return res.data
  },

  async create(collectionId: number, content: string): Promise<CollectionComment> {
    const res = await apiClient.post<CollectionComment>('/collection-comments', {
      collection_id: collectionId,
      content,
    })
    return res.data
  },

  async delete(commentId: number): Promise<void> {
    await apiClient.delete(`/collection-comments/${commentId}`)
  },
}
