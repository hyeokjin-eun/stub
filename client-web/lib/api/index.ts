// Export all API modules
export { authApi } from './auth'
export { categoriesApi } from './categories'
export { catalogItemsApi } from './catalogItems'
export { catalogGroupsApi } from './catalogGroups'
export { likesApi } from './likes'
export { followsApi } from './follows'
export { usersApi } from './users'
export { achievementsApi } from './achievements'
export { uploadApi } from './upload'
export { bannersApi } from './banners'
export { stubsApi } from './stubs'
export { collectionsApi } from './collections'
export { collectionLikesApi } from './collectionLikes'
export { notificationsApi } from './notifications'
export type { NotificationItem, NotificationType } from './notifications'
export { collectionCommentsApi } from './collectionComments'

// Export types
export * from './types'

// Export API client
export { apiClient } from './client'
