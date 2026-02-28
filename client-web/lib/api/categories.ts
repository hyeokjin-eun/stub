import apiClient from './client'
import type { Category, ItemType, ItemTypeUiConfig } from './types'

export const categoriesApi = {
  /**
   * item_type별 전체 트리 (대분류 → 중분류 → 소분류 중첩)
   */
  async getTree(itemType?: ItemType): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories/tree', {
      params: itemType ? { item_type: itemType } : undefined,
    })
    return response.data
  },

  /**
   * 대분류 목록만 flat하게
   */
  async getRoots(itemType?: ItemType): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories/roots', {
      params: itemType ? { item_type: itemType } : undefined,
    })
    return response.data
  },

  /**
   * 특정 카테고리의 자식 목록
   */
  async getChildren(parentId: number): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(`/categories/${parentId}/children`)
    return response.data
  },

  /**
   * 소분류 → 중분류 → 대분류 경로
   */
  async getBreadcrumb(id: number): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(`/categories/${id}/breadcrumb`)
    return response.data
  },

  /**
   * ID로 단일 카테고리 조회
   */
  async getById(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${id}`)
    return response.data
  },

  /**
   * code로 단일 카테고리 조회
   */
  async getByCode(code: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/code/${code}`)
    return response.data
  },

  /**
   * 모든 ItemType UI 설정 조회
   */
  async getItemTypeConfigs(): Promise<ItemTypeUiConfig[]> {
    const response = await apiClient.get<ItemTypeUiConfig[]>('/categories/item-types/configs')
    return response.data
  },
}
