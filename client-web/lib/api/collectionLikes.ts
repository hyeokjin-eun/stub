import apiClient from './client'

export const collectionLikesApi = {
  /** 좋아요 토글 → { liked, likeCount } */
  async toggle(collectionId: number): Promise<{ liked: boolean; likeCount: number }> {
    const res = await apiClient.post(`/collection-likes/toggle/${collectionId}`)
    return res.data
  },

  /** 좋아요 상태 + 카운트 조회 */
  async getStatus(collectionId: number): Promise<{ liked: boolean; likeCount: number }> {
    const res = await apiClient.get(`/collection-likes/status/${collectionId}`)
    return res.data
  },

  /** 여러 컬렉션 좋아요 수 합산 */
  async getTotalLikes(collectionIds: number[]): Promise<number> {
    if (collectionIds.length === 0) return 0
    const results = await Promise.all(
      collectionIds.map((id) =>
        apiClient.get(`/collection-likes/status/${id}`).then((r) => r.data.likeCount as number).catch(() => 0)
      )
    )
    return results.reduce((s, n) => s + n, 0)
  },
}
