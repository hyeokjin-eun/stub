'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, RefreshCw } from 'lucide-react'

interface Props {
  title: string
  gold?: string          // 골드 강조 단어
  onRefresh?: () => void
  refreshing?: boolean
  right?: React.ReactNode
  back?: boolean         // 뒤로가기 버튼 (기본 true)
}

export default function PageHeader({ title, gold, onRefresh, refreshing, right, back = true }: Props) {
  const router = useRouter()

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px',
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
    }}>
      {back && (
        <button
          onClick={() => router.back()}
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--txt-muted)', flexShrink: 0,
          }}
        >
          <ChevronLeft size={18} />
        </button>
      )}

      <div style={{ flex: 1, fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: '.06em' }}>
        {title}{gold && <> <span style={{ color: 'var(--gold)' }}>{gold}</span></>}
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          style={{ padding: 6, color: 'var(--txt-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      )}

      {right}
    </div>
  )
}
