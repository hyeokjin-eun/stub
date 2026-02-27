import apiClient from './client'
import type { UploadResponse } from './types'

export const uploadApi = {
  /**
   * Upload an image file
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<UploadResponse>(
      '/upload/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data
  },

  /**
   * Get full URL for an uploaded image
   */
  getImageUrl(url: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
    return `${baseUrl}${url}`
  },
}
