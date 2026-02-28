'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderHeart, Users, ImageIcon,
  Settings, Megaphone, LogOut, Menu, X, ChevronRight,
} from 'lucide-react'

const GROUPS = [
  { label: 'Overview', items: [
    { href: '/',        icon: LayoutDashboard, label: '대시보드' },
  ]},
  { label: 'Contents', items: [
    { href: '/works',   icon: FolderHeart,     label: '카탈로그 관리' },
    { href: '/banners', icon: ImageIcon,       label: '배너 관리' },
  ]},
  { label: 'Users', items: [
    { href: '/users',   icon: Users,           label: '유저 관리' },
    { href: '/notify',  icon: Megaphone,       label: '공지 발송' },
  ]},
  { label: 'Config', items: [
    { href: '/categories', icon: Settings,     label: '카테고리' },
    { href: '/settings',   icon: Settings,     label: '앱 설정' },
  ]},
]

const MOBILE = [
  { href: '/',       icon: LayoutDashboard, label: '홈' },
  { href: '/works',  icon: FolderHeart,     label: '카탈로그' },
  { href: '/users',  icon: Users,           label: '유저' },
  { href: '/banners',icon: ImageIcon,       label: '배너' },
  { href: '/categories', icon: Settings,    label: '설정' },
]

const TITLES: Record<string, string> = {
  '/': '대시보드', '/works': '카탈로그 관리', '/banners': '배너 관리',
  '/users': '유저 관리', '/notify': '공지 발송',
  '/categories': '카테고리 설정', '/settings': '앱 설정',
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  const logout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0'
    localStorage.removeItem('admin_token')
    router.push('/login')
  }

  return (
    <div className="shell">
      {/* overlay */}
      {open && <div className="sb-overlay" onClick={() => setOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">OT</div>
          <div className="sidebar-logo-text">OT<span>BOOK</span></div>
          <div className="sidebar-logo-badge">ADMIN</div>
        </div>

        <div className="sidebar-body">
          {GROUPS.map(g => (
            <div key={g.label} className="sidebar-group">
              <div className="sidebar-group-label">{g.label}</div>
              {g.items.map(item => {
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                return (
                  <div key={item.href} className={`nav-item ${active ? 'active' : ''}`}
                    onClick={() => router.push(item.href)}>
                    <item.icon size={15} />
                    <span>{item.label}</span>
                    {active && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: .4 }} />}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={logout} style={{ color: 'var(--txt-3)' }}>
            <LogOut size={15} /><span>로그아웃</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-wrap">
        <header className="topbar">
          <button className="ham" onClick={() => setOpen(o => !o)}>
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
          <span className="topbar-title">{TITLES[pathname] ?? 'Admin'}</span>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--gold-dim)', border: '1px solid rgba(212,168,75,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: 'var(--gold)', fontFamily: 'DM Mono',
          }}>A</div>
        </header>

        <main className="page">{children}</main>
      </div>

      {/* ── Mobile nav ── */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {MOBILE.map(({ href, icon: Icon, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <div key={href} className={`mobile-nav-item ${active ? 'on' : ''}`}
                onClick={() => router.push(href)}>
                <Icon size={19} /><span>{label}</span>
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
