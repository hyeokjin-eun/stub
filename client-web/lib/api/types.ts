// API Response Types

export interface User {
  id: number
  email: string
  nickname: string
  bio: string | null
  avatar_url: string | null
  phone: string | null
  birth_date: string | null
  onboarding_completed: boolean
  oauth_provider: string | null
  oauth_id: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  code: string
  name: string
  icon: string
  color: string
  created_at: string
}

export interface CatalogGroup {
  id: number
  name: string
  description: string | null
  category_id: number
  creator_id: number
  is_official: boolean
  color: string
  icon: string
  thumbnail_url: string | null
  is_public: boolean
  status: string
  view_count: number
  ticket_count: number
  parent_group_id: number | null
  created_at: string
  updated_at: string
  category?: Category
  creator?: User
}

export interface CatalogItemMetadata {
  item_id: number
  metadata: {
    type: 'ticket' | 'card' | 'goods'
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

export interface CatalogItem {
  id: number
  title: string
  description: string | null
  category_id: number
  catalog_group_id: number | null
  owner_id: number
  status: 'collected' | 'wish' | 'trading'
  image_url: string | null
  thumbnail_url: string | null
  color: string | null
  icon: string | null
  is_public: boolean
  like_count: number
  view_count: number
  sort_order: number
  created_at: string
  updated_at: string
  metadata?: CatalogItemMetadata
  owner?: User
  category?: Category
  catalog_group?: CatalogGroup | null
}

export interface Stub {
  id: number
  user_id: number
  catalog_item_id: number | null
  image_url: string | null
  status: 'collected' | 'wish' | 'trading'
  condition: 'mint' | 'good' | 'worn' | null
  notes: string | null
  acquired_at: string | null
  created_at: string
  updated_at: string
  catalog_item?: CatalogItem
}

export interface CollectionItem {
  id: number
  collection_id: number
  catalog_item_id: number
  stub_id: number | null
  order_index: number
  created_at: string
  catalog_item?: CatalogItem
  stub?: Stub
}

export interface Collection {
  id: number
  user_id: number
  name: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  collection_items: CollectionItem[]
  total_count: number
  collected_count: number
  like_count?: number
}

export interface CollectionComment {
  id: number
  collection_id: number
  user_id: number
  content: string
  created_at: string
  updated_at: string
  user?: User
}

export interface Achievement {
  code: string
  name: string
  description: string
  icon: string
  achieved: boolean
  achievedAt?: string
}

export interface Banner {
  id: number
  title: string
  subtitle: string | null
  tag: string | null
  image_url: string
  link_url: string | null
  background_color: string
  order_index: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface UserStats {
  user_id: number
  ticket_count: number
  follower_count: number
  following_count: number
  total_likes: number
  achievement_count: number
}

// API Request Types

export interface SignupRequest {
  email: string
  password: string
  nickname: string
  bio?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface CreateCatalogItemRequest {
  title: string
  description?: string
  category_id: number
  catalog_group_id?: number
  status?: 'collected' | 'wish' | 'trading'
  image_url?: string
  thumbnail_url?: string
  color?: string
  icon?: string
  is_public?: boolean
  metadata: {
    type: 'ticket' | 'card' | 'goods'
    [key: string]: any
  }
}

export interface UpdateCatalogItemRequest {
  title?: string
  description?: string
  category_id?: number
  catalog_group_id?: number
  status?: 'collected' | 'wish' | 'trading'
  image_url?: string
  thumbnail_url?: string
  color?: string
  icon?: string
  is_public?: boolean
  metadata?: {
    type?: 'ticket' | 'card' | 'goods'
    [key: string]: any
  }
}

export interface CreateCatalogGroupRequest {
  name: string
  description?: string
  category_id: number
  color: string
  icon: string
  thumbnail_url?: string
  is_public?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UploadResponse {
  filename: string
  url: string
  size: number
  mimetype: string
}
