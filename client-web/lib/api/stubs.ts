import apiClient from './client'
import type { Stub } from './types'

export const stubsApi = {
  // 내 스텁 전체 목록
  async getMyStubs(): Promise<Stub[]> {
    const res = await apiClient.get<Stub[]>('/stubs/me')
    return res.data
  },

  // 특정 카탈로그 아이템 보유 여부
  async getMyStubByCatalogItem(catalogItemId: number): Promise<Stub | null> {
    try {
      const res = await apiClient.get<Stub>(`/stubs/me/catalog-item/${catalogItemId}`)
      return res.data
    } catch {
      return null
    }
  },

  // 그룹 기준 보유 맵 { catalog_item_id → stub_id }
  async getOwnedMapByGroup(groupId: number): Promise<Record<number, number>> {
    const res = await apiClient.get<Record<number, number>>(`/stubs/me/group/${groupId}`)
    return res.data
  },

  // 보유 등록
  async create(data: {
    catalog_item_id?: number
    image_url?: string
    status?: string
    condition?: string
    notes?: string
    acquired_at?: string
  }): Promise<Stub> {
    const res = await apiClient.post<Stub>('/stubs', data)
    return res.data
  },

  // 보유 수정
  async update(
    id: number,
    data: {
      image_url?: string
      status?: string
      condition?: string
      notes?: string
      acquired_at?: string
    },
  ): Promise<Stub> {
    const res = await apiClient.patch<Stub>(`/stubs/${id}`, data)
    return res.data
  },

  // 보유 해제
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/stubs/${id}`)
  },
}
