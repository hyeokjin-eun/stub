import apiClient from './client'
import type { AppSettings } from './types'

export const appSettingsApi = {
  /**
   * 앱 설정 조회
   */
  async getSettings(): Promise<AppSettings> {
    const response = await apiClient.get<AppSettings>('/app-settings')
    return response.data
  },
}
