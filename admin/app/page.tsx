'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, FolderHeart, BookOpen, Library, RefreshCw, ChevronRight, TrendingUp } from 'lucide-react'
import { adminApi } from '@/lib/api'

const STAT_CFG = [
  { key: 'users',       label: '유저',   icon: Users,      href: '/users',   accent: '#60a5fa', bg: 'rgba(96,165,250,.1)' },
  { key: 'groups',      label: '수집품',  icon: FolderHeart,href: '/tickets', accent: '#d4a84b', bg: 'rgba(212,168,75,.1)' },
  { key: 'tickets',     label: '수집 아이템', icon: BookOpen, href: '/tickets', accent: '#a78bfa', bg: 'rgba(167,139,250,.1)' },
  { key: 'collections', label: '컬렉션',  icon: Library,    href: '/tickets', accent: '#4ade80', bg: 'rgba(74,222,128,.1)' },
] as const

const QUICK = [
  { href: '/tickets',    label: '수집품 관리',  desc: '작품 등록 · 수정 · 삭제' },
  { href: '/users',      label: '유저 관리',    desc: '가입 유저 조회 및 권한' },
  { href: '/banners',    label: '배너 관리',    desc: '홈 화면 배너 편집' },
  { href: '/categories', label: '카테고리 설정', desc: 'UI 플래그 · 필터 관리' },
  { href: '/notify',     label: '공지 발송',    desc: '전체 유저 알림 발송' },
  { href: '/settings',   label: '앱 설정',      desc: '앱 기본 정보 관리' },
]

export default function DashboardPage() {
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

  return (
    <div>
      {/* Page header */}
      <div className="ph">
        <div>
          <h1>Overview</h1>
          <div className="ph-sub">서비스 현황 및 주요 지표</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            새로고침
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        {STAT_CFG.map(s => (
          <div key={s.key} className="stat" onClick={() => router.push(s.href)}
            style={{ ['--accent' as string]: s.accent, ['--accent-bg' as string]: s.bg }}>
            <div className="stat-icon"><s.icon size={15} /></div>
            <div className="stat-val">{loading ? '—' : stats[s.key].toLocaleString()}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {QUICK.map(q => (
          <div key={q.href} className="panel" onClick={() => router.push(q.href)}
            style={{ cursor: 'pointer', transition: 'border-color .12s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{q.label}</div>
                <div style={{ fontSize: 11, color: 'var(--txt-3)', marginTop: 3 }}>{q.desc}</div>
              </div>
              <ChevronRight size={15} color="var(--txt-3)" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div style={{ marginTop: 24, padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <TrendingUp size={13} color="var(--txt-3)" />
        <span style={{ fontSize: 11, color: 'var(--txt-3)', fontFamily: 'DM Mono' }}>
          API — {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}
        </span>
      </div>
    </div>
  )
}
