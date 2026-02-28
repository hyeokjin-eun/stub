'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderHeart, Users, Image, Settings,
  Megaphone, LogOut, ChevronRight, Menu, X,
} from 'lucide-react'

const NAV = [
  {
    group: '대시보드',
    items: [
      { href: '/',           icon: LayoutDashboard, label: '개요' },
    ],
  },
  {
    group: '콘텐츠',
    items: [
      { href: '/tickets',    icon: FolderHeart,     label: '수집품 관리' },
      { href: '/banners',    icon: Image,           label: '배너 관리' },
    ],
  },
  {
    group: '운영',
    items: [
      { href: '/users',      icon: Users,           label: '유저 관리' },
      { href: '/notify',     icon: Megaphone,       label: '공지 발송' },
    ],
  },
  {
    group: '설정',
    items: [
      { href: '/categories', icon: Settings,        label: '카테고리 설정' },
      { href: '/settings',   icon: Settings,        label: '앱 설정' },
    ],
  },
]

const MOBILE_NAV = [
  { href: '/',           icon: LayoutDashboard, label: '홈' },
  { href: '/tickets',    icon: FolderHeart,     label: '수집품' },
  { href: '/users',      icon: Users,           label: '유저' },
  { href: '/banners',    icon: Image,           label: '배너' },
  { href: '/categories', icon: Settings,        label: '설정' },
]

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/':           { title: '대시보드',     sub: '서비스 현황 및 통계' },
  '/tickets':    { title: '수집품 관리',  sub: '등록된 작품 및 수집품 관리' },
  '/banners':    { title: '배너 관리',    sub: '홈 화면 배너 등록 및 순서 관리' },
  '/users':      { title: '유저 관리',    sub: '가입 유저 조회 및 권한 관리' },
  '/notify':     { title: '공지 발송',    sub: '전체 유저 푸시 알림 발송' },
  '/categories': { title: '카테고리 설정', sub: 'UI 플래그 및 필터 설정' },
  '/settings':   { title: '앱 설정',     sub: '앱 기본 정보 관리' },
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const pageInfo = PAGE_TITLES[pathname] ?? { title: 'Admin', sub: '' }

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0'
    localStorage.removeItem('admin_token')
    router.push('/login')
  }

  // close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <div className="shell">
      {/* ── Sidebar overlay (mobile) ── */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          OT<span>BOOK</span>
          <sub>Admin Console</sub>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(group => (
            <div key={group.group}>
              <div className="sidebar-group-label">{group.group}</div>
              {group.items.map(item => {
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                return (
                  <div
                    key={item.href}
                    className={`sidebar-item ${active ? 'active' : ''}`}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon size={16} />
                    {item.label}
                    {active && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: .5 }} />}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-item" onClick={handleLogout} style={{ color: 'var(--txt-muted)' }}>
            <LogOut size={16} />
            로그아웃
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-wrap">
        {/* Topbar */}
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(o => !o)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt)', lineHeight: 1.2 }}>
              {pageInfo.title}
            </div>
            {pageInfo.sub && (
              <div style={{ fontSize: 11, color: 'var(--txt-muted)', marginTop: 1 }}>
                {pageInfo.sub}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--gold-dim)',
              border: '1px solid rgba(201,168,76,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'var(--gold)',
              fontFamily: 'DM Mono',
            }}>A</div>
          </div>
        </header>

        {/* Content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {MOBILE_NAV.map(({ href, icon: Icon, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <div key={href} className={`mobile-nav-item ${active ? 'active' : ''}`} onClick={() => router.push(href)}>
                <Icon size={20} />
                <span>{label}</span>
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
