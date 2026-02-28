import axios from 'axios'

// 브라우저: Next.js rewrite(/api → localhost:3002) 활용
// 서버사이드: 환경변수 직접 사용
const baseURL = typeof window !== 'undefined'
  ? '/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')

const API = axios.create({ baseURL })

// 토큰 주입
API.interceptors.request.use(cfg => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default API

// ── types ──────────────────────────────────────────────────────────────────
export interface User {
  id: number; email: string; nickname: string;
  bio: string | null; avatar_url: string | null;
  onboarding_completed: boolean; created_at: string;
}
export interface CatalogGroup {
  id: number;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  color: string | null;
  icon: string | null;
  ticket_count: number;
  status: string;
  category_id: number;
  category?: {
    id: number; code: string; name: string; color: string;
    parent?: { id: number; code: string; name: string };
  };
}
export interface CatalogItem {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  color: string | null;
  status: string;
  is_public: boolean;
  sort_order: number;
  like_count: number;
  view_count: number;
  catalog_group_id: number;
  category_id: number;
  owner_id: number;
  created_at: string;
  owner?: { id: number; nickname: string; email: string; avatar_url: string | null };
}
export interface Banner {
  id: number; title: string; image_url: string | null;
  link_url: string | null; is_active: boolean;
  sort_order: number; created_at: string;
}
export interface AppSettings {
  id: number;
  app_title: string;
  app_subtitle: string | null;
  app_description: string | null;
  created_at: string;
  updated_at: string;
}
export interface CategoryUiConfig {
  id: number;
  category_id: number;
  is_default: boolean;
  skip_ui: boolean;
  auto_expand: boolean;
  show_in_filter: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}
export interface ItemTypeUiConfig {
  id: number;
  item_type: string;
  is_default: boolean;
  skip_ui: boolean;
  show_in_tab: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export interface Category {
  id: number;
  code: string;
  name: string;
  icon: string;
  color: string;
  depth: number;
  parent_id: number | null;
  item_type: string | null;
  sort_order: number;
  created_at: string;
  ui_config?: CategoryUiConfig | null;
  parent?: Category;
  children?: Category[];
}

// ── API helpers ────────────────────────────────────────────────────────────
export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    API.post('/auth/admin/login', { email, password }).then(r => r.data),

  setUserRole: (id: number, role: 'USER' | 'ADMIN') =>
    API.patch(`/auth/users/${id}/role`, { role }).then(r => r.data),
  // Stats
  stats: () => Promise.all([
    API.get('/users/count').then(r => r.data.total as number).catch(() => 0),
    API.get('/catalog-items?limit=1').then(r => r.data.total as number).catch(() => 0),
    API.get('/catalog-groups?limit=1').then(r => r.data.total as number).catch(() => 0),
    API.get('/collections?limit=1').then(r => r.data.total as number).catch(() => 0),
  ]).then(([users, tickets, groups, collections]) => ({ users, tickets, groups, collections })),

  // Users
  users: (page = 1, limit = 20) => API.get(`/users?page=${page}&limit=${limit}`).then(r => r.data),

  // Catalog Groups
  groups: (page = 1, limit = 20, categoryId?: number) =>
    API.get(`/catalog-groups`, { params: { page, limit, ...(categoryId ? { category_id: categoryId } : {}) } }).then(r => r.data),
  createGroup: (data: Partial<CatalogGroup>) => API.post('/catalog-groups', data).then((r: { data: unknown }) => r.data),
  updateGroup: (id: number, data: Partial<CatalogGroup>) => API.patch(`/catalog-groups/${id}`, data).then((r: { data: unknown }) => r.data),
  deleteGroup: (id: number) => API.delete(`/catalog-groups/${id}`),

  // Catalog Items
  items: (groupId: number, page = 1, limit = 50) =>
    API.get(`/catalog-items`, { params: { catalog_group_id: groupId, page, limit } }).then(r => r.data),
  updateItem: (id: number, data: Partial<CatalogItem>) =>
    API.patch(`/catalog-items/admin/${id}`, data).then(r => r.data),
  deleteItem: (id: number) =>
    API.delete(`/catalog-items/admin/${id}`).then(r => r.data),
  createItem: (data: Record<string, unknown>) =>
    API.post('/catalog-items', data).then(r => r.data),

  // Banners
  banners: () => API.get('/banners').then(r => r.data),
  createBanner: (data: Partial<Banner>) => API.post('/banners', data).then(r => r.data),
  updateBanner: (id: number, data: Partial<Banner>) => API.patch(`/banners/${id}`, data).then(r => r.data),
  deleteBanner: (id: number) => API.delete(`/banners/${id}`),

  // Notifications (system)
  sendNotification: (data: { message: string; targetUrl?: string }) =>
    API.post('/notifications/system', data).then(r => r.data),

  // Categories
  categoriesTree: (itemType?: string) =>
    API.get('/categories/tree', { params: itemType ? { item_type: itemType } : undefined }).then(r => r.data),

  // Category UI Config
  allUiConfigs: () => API.get('/categories/ui-configs/all').then(r => r.data),
  getUiConfig: (categoryId: number) => API.get(`/categories/${categoryId}/ui-config`).then(r => r.data),
  updateUiConfig: (categoryId: number, data: Partial<Omit<CategoryUiConfig, 'id' | 'category_id' | 'created_at' | 'updated_at'>>) =>
    API.put(`/categories/${categoryId}/ui-config`, data).then(r => r.data),
  deleteUiConfig: (categoryId: number) => API.delete(`/categories/${categoryId}/ui-config`).then(r => r.data),

  // ItemType UI Config
  allItemTypeConfigs: () => API.get('/categories/item-types/configs').then(r => r.data),
  getItemTypeConfig: (itemType: string) => API.get(`/categories/item-types/${itemType}/config`).then(r => r.data),
  updateItemTypeConfig: (itemType: string, data: Partial<Omit<ItemTypeUiConfig, 'id' | 'item_type' | 'created_at' | 'updated_at'>>) =>
    API.put(`/categories/item-types/${itemType}/config`, data).then(r => r.data),
  deleteItemTypeConfig: (itemType: string) => API.delete(`/categories/item-types/${itemType}/config`).then(r => r.data),

  // App Settings
  getAppSettings: () => API.get('/app-settings').then(r => r.data),
  updateAppSettings: (data: Partial<Omit<AppSettings, 'id' | 'created_at' | 'updated_at'>>) =>
    API.put('/app-settings', data).then(r => r.data),
}
