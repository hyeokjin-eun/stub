import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
})

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
  id: number; title: string; description: string;
  image_url: string | null; color: string | null;
  category?: { code: string; name: string };
}
export interface CatalogItem {
  id: number; title: string; image_url: string | null;
  catalog_group_id: number; created_at: string;
}
export interface Banner {
  id: number; title: string; image_url: string | null;
  link_url: string | null; is_active: boolean;
  sort_order: number; created_at: string;
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
  groups: (page = 1, limit = 20) => API.get(`/catalog-groups?page=${page}&limit=${limit}`).then(r => r.data),
  createGroup: (data: Partial<CatalogGroup>) => API.post('/catalog-groups', data).then(r => r.data),
  updateGroup: (id: number, data: Partial<CatalogGroup>) => API.patch(`/catalog-groups/${id}`, data).then(r => r.data),
  deleteGroup: (id: number) => API.delete(`/catalog-groups/${id}`),

  // Catalog Items (tickets)
  tickets: (page = 1, limit = 20) => API.get(`/catalog-items?page=${page}&limit=${limit}`).then(r => r.data),
  createTicket: (data: any) => API.post('/catalog-items', data).then(r => r.data),
  updateTicket: (id: number, data: any) => API.patch(`/catalog-items/${id}`, data).then(r => r.data),
  deleteTicket: (id: number) => API.delete(`/catalog-items/${id}`),

  // Banners
  banners: () => API.get('/banners').then(r => r.data),
  createBanner: (data: Partial<Banner>) => API.post('/banners', data).then(r => r.data),
  updateBanner: (id: number, data: Partial<Banner>) => API.patch(`/banners/${id}`, data).then(r => r.data),
  deleteBanner: (id: number) => API.delete(`/banners/${id}`),

  // Notifications (system)
  sendNotification: (data: { message: string; targetUrl?: string }) =>
    API.post('/notifications/system', data).then(r => r.data),
}
