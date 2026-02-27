'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, Users, FolderHeart, LayoutGrid, ChevronRight, RefreshCw } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { adminApi } from '@/lib/api'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ users: 0, tickets: 0, groups: 0, collections: 0 })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const s = await adminApi.stats().catch(() => ({ users: 0, tickets: 0, groups: 0, collections: 0 }))
    setStats(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const STATS = [
    { label: '총 유저',     val: stats.users,       icon: Users,       href: '/users' },
    { label: '총 티켓',     val: stats.tickets,      icon: Ticket,      href: '/tickets' },
    { label: '그룹',        val: stats.groups,       icon: LayoutGrid,  href: '/tickets' },
    { label: '컬렉션',      val: stats.collections,  icon: FolderHeart, href: '/tickets' },
  ]

  const MENUS = [
    { label: '티켓 관리',    sub: '등록 · 수정 · 삭제',    href: '/tickets',  icon: Ticket },
    { label: '유저 관리',    sub: '목록 · 정보 조회',       href: '/users',    icon: Users },
    { label: '배너 관리',    sub: '홈 배너 등록 · 순서',    href: '/banners',  icon: LayoutGrid },
    { label: '공지 발송',    sub: '시스템 알림 전체 발송',  href: '/notify',   icon: LayoutGrid },
  ]

  return (
    <div className="admin-container">
      <div className="admin-main" style={{ padding: '0 16px' }}>
        {/* Header */}
        <div style={{ padding: '16px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: '.08em' }}>
            OT<span style={{ color: 'var(--gold)' }}>BOOK</span> <span style={{ fontSize: 14, color: 'var(--txt-muted)', fontFamily: 'DM Mono' }}>ADMIN</span>
          </div>
          <div onClick={load} style={{ cursor: 'pointer', color: 'var(--txt-muted)', padding: 6 }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="a-stats" style={{ marginTop: 12 }}>
          {STATS.map(s => (
            <div key={s.label} className="a-stat" style={{ cursor: 'pointer' }} onClick={() => router.push(s.href)}>
              <s.icon size={16} color="var(--txt-muted)" style={{ marginBottom: 8 }} />
              <div className="a-stat-val">{loading ? '...' : s.val.toLocaleString()}</div>
              <div className="a-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Menu */}
        <div className="a-section">관리 메뉴</div>
        <div className="a-list">
          {MENUS.map(m => (
            <div key={m.href} className="a-row" onClick={() => router.push(m.href)}>
              <div className="a-row-icon"><m.icon size={18} /></div>
              <div className="a-row-body">
                <div className="a-row-title">{m.label}</div>
                <div className="a-row-sub">{m.sub}</div>
              </div>
              <ChevronRight size={16} color="var(--txt-muted)" />
            </div>
          ))}
        </div>

        {/* Server info */}
        <div style={{ padding: '20px 0 4px', fontSize: 11, color: 'var(--txt-muted)', fontFamily: 'DM Mono' }}>
          API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
