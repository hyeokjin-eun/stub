import apiClient from './client'

export type NotificationType =
  | 'LIKE_COLLECTION'
  | 'LIKE_TICKET'
  | 'FOLLOW'
  | 'COMMENT'
  | 'MENTION'
  | 'SYSTEM'

export interface NotificationItem {
  id: number
  user_id: number
  actor_id: number | null
  type: NotificationType
  message: string
  target_url: string | null
  is_read: boolean
  created_at: string
  actor?: {
    id: number
    nickname: string
    avatar_url: string | null
  }
}

export const notificationsApi = {
  async getAll(page = 1, limit = 20): Promise<{ data: NotificationItem[]; total: number; unread: number }> {
    const res = await apiClient.get('/notifications', { params: { page, limit } })
    return res.data
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get('/notifications/unread-count')
    return res.data.count
  },

  async markRead(id: number): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`)
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all')
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/notifications/${id}`)
  },
}
