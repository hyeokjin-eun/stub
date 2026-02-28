'use client'

import { useEffect, useState } from 'react'
import { Search, X, User as UserIcon, Mail, Calendar, Shield, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/Toast'
import { adminApi } from '@/lib/api'
import type { User } from '@/lib/api'

type UserWithRole = User & { role?: 'USER' | 'ADMIN' }

export default function UsersPage() {
  const [users, setUsers]     = useState<UserWithRole[]>([])
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<UserWithRole | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const { show: toast, node: toastNode } = useToast()

  const load = async () => {
    setLoading(true)
    adminApi.users(1, 100)
      .then((d: { data?: UserWithRole[] }) => setUsers(d.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter(u =>
    !query || u.nickname.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
  )

  const handleRoleChange = async (role: 'USER' | 'ADMIN') => {
    if (!selected) return
    setRoleLoading(true)
    try {
      await adminApi.setUserRole(selected.id, role)
      const updated = { ...selected, role }
      setUsers(prev => prev.map(u => u.id === selected.id ? updated : u))
      setSelected(updated)
      toast(`${selected.nickname}님을 ${role}로 변경했어요`)
    } catch { toast('권한 변경 실패', 'error') }
    finally { setRoleLoading(false) }
  }

  return (
    <div>
      <div className="ph">
        <div>
          <h1>유저 관리</h1>
          <div className="ph-sub">가입 유저 목록 및 권한 관리</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={13} className={loading ? 'spin' : ''} />새로고침</button>
        </div>
      </div>

      <div className="panel">
        <div className="toolbar">
          <div className="search" style={{ flex: 1 }}>
            <Search size={13} color="var(--txt-3)" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="닉네임 · 이메일 검색..." />
            {query && <X size={13} style={{ cursor: 'pointer', color: 'var(--txt-3)' }} onClick={() => setQuery('')} />}
          </div>
          <span className="panel-count">{filtered.length}명</span>
        </div>

        {loading ? (
          <div className="empty"><div className="empty-title">로딩 중...</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty"><div className="empty-title">유저가 없어요</div></div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 46 }}></th>
                <th>닉네임</th>
                <th>이메일</th>
                <th>권한</th>
                <th>상태</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} onClick={() => setSelected(u)}>
                  <td className="no-label">
                    <div className="tbl-thumb-box" style={{ borderRadius: '50%' }}>
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : <UserIcon size={15} color="var(--txt-3)" />}
                    </div>
                  </td>
                  <td data-label="닉네임">
                    <div className="cell-name">{u.nickname}</div>
                    <div className="cell-sub">#{u.id}</div>
                  </td>
                  <td data-label="이메일"><span className="cell-mono">{u.email}</span></td>
                  <td data-label="권한">
                    {u.role === 'ADMIN'
                      ? <span className="badge badge-gold"><Shield size={9} />ADMIN</span>
                      : <span className="badge badge-muted">USER</span>}
                  </td>
                  <td data-label="상태">
                    <span className={`badge ${u.onboarding_completed ? 'badge-green' : 'badge-blue'}`}>
                      {u.onboarding_completed ? '활성' : '온보딩'}
                    </span>
                  </td>
                  <td data-label="가입일"><span className="cell-mono">{new Date(u.created_at).toLocaleDateString('ko-KR')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User detail modal */}
      {selected && (
        <div className="backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">유저 상세</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}><X size={15} /></button>
            </div>
            <div className="modal-body">
              {/* Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '4px 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selected.avatar_url
                    ? <img src={selected.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <UserIcon size={22} color="var(--txt-3)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.nickname}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt-3)', marginTop: 2 }}>ID #{selected.id}</div>
                </div>
                <span className={`badge ${selected.role === 'ADMIN' ? 'badge-gold' : 'badge-muted'}`}>{selected.role ?? 'USER'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { icon: Mail,     label: '이메일', val: selected.email },
                  { icon: Calendar, label: '가입일',  val: new Date(selected.created_at).toLocaleDateString('ko-KR') },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <row.icon size={13} color="var(--txt-3)" />
                    <span style={{ fontSize: 11, color: 'var(--txt-3)', width: 44, flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 13 }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {selected.bio && (
                <div style={{ marginTop: 10, padding: '10px 0', fontSize: 13, color: 'var(--txt-2)', lineHeight: 1.7 }}>{selected.bio}</div>
              )}

              <div style={{ marginTop: 18 }}>
                <div className="lbl" style={{ marginBottom: 8 }}>권한 변경</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['USER', 'ADMIN'] as const).map(role => (
                    <button key={role} className={`btn ${selected.role === role ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ flex: 1 }} disabled={roleLoading || selected.role === role}
                      onClick={() => handleRoleChange(role)}>
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastNode}
    </div>
  )
}
