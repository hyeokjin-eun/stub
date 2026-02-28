'use client'

import { useEffect, useState } from 'react'
import { Search, X, User as UserIcon, Mail, Calendar } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { adminApi } from '@/lib/api'
import type { User } from '@/lib/api'

export default function UsersPage() {
  const [users, setUsers]   = useState<User[]>([])
  const [query, setQuery]   = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<User | null>(null)

  useEffect(() => {
    adminApi.users(1, 100)
      .then(d => setUsers(d.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    !query || u.nickname.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="admin-container">
      <div className="admin-main" style={{ padding: '0 16px' }}>
        <div style={{ padding: '16px 0 12px', fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: '.06em' }}>
          유저 <span style={{ color: 'var(--gold)' }}>관리</span>
          <span style={{ fontSize: 12, fontFamily: 'DM Mono', color: 'var(--txt-muted)', marginLeft: 8 }}>
            {users.length}명
          </span>
        </div>

        <div className="a-search">
          <Search size={14} color="var(--txt-muted)" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="닉네임 · 이메일 검색..." />
          {query && <X size={14} color="var(--txt-muted)" style={{ cursor: 'pointer' }} onClick={() => setQuery('')} />}
        </div>

        {loading ? (
          <div className="a-empty"><div className="a-empty-title">로딩 중...</div></div>
        ) : filtered.length === 0 ? (
          <div className="a-empty">
            <div className="a-empty-title">유저가 없어요</div>
          </div>
        ) : (
          <div className="a-list">
            {filtered.map(u => (
              <div key={u.id} className="a-row" onClick={() => setSelected(u)}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                  background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <UserIcon size={18} color="var(--txt-muted)" />
                  }
                </div>
                <div className="a-row-body">
                  <div className="a-row-title">{u.nickname}</div>
                  <div className="a-row-sub">{u.email}</div>
                </div>
                <span className={`a-badge ${u.onboarding_completed ? 'green' : ''}`}>
                  {u.onboarding_completed ? '활성' : '온보딩'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

        {selected && (
          <div className="a-backdrop" onClick={() => setSelected(null)}>
            <div className="a-sheet" onClick={e => e.stopPropagation()}>
              <div className="a-sheet-handle" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', overflow: 'hidden',
                  background: 'var(--border)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selected.avatar_url
                    ? <img src={selected.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <UserIcon size={24} color="var(--txt-muted)" />
                  }
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.nickname}</div>
                  <div style={{ fontSize: 12, color: 'var(--txt-muted)', marginTop: 2 }}>ID: {selected.id}</div>
                </div>
                <span className={`a-badge ${(selected as any).role === 'ADMIN' ? '' : 'green'}`} style={{ marginLeft: 'auto' }}>
                  {(selected as any).role ?? 'USER'}
                </span>
              </div>

              {[
                { icon: Mail, label: '이메일', val: selected.email },
                { icon: Calendar, label: '가입일', val: new Date(selected.created_at).toLocaleDateString('ko-KR') },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <row.icon size={15} color="var(--txt-muted)" />
                  <span style={{ fontSize: 12, color: 'var(--txt-muted)', width: 50 }}>{row.label}</span>
                  <span style={{ fontSize: 13 }}>{row.val}</span>
                </div>
              ))}

              {selected.bio && (
                <div style={{ marginTop: 14, fontSize: 13, color: 'var(--txt-muted)', lineHeight: 1.6 }}>
                  {selected.bio}
                </div>
              )}

              {/* Role 변경 */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--txt-muted)', marginBottom: 10 }}>권한 변경</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['USER', 'ADMIN'] as const).map(role => (
                    <button
                      key={role}
                      className={`a-btn ${(selected as any).role === role ? 'a-btn-primary' : 'a-btn-ghost'}`}
                      style={{ flex: 1, fontSize: 13 }}
                      onClick={async () => {
                        await adminApi.setUserRole(selected.id, role).catch(() => null)
                        setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, role } as any : u))
                        setSelected(prev => prev ? { ...prev, role } as any : null)
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      <BottomNav />
    </div>
  )
}
