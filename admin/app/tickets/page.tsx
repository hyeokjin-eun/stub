'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, X, Trash2, Edit2, Film, Star, ChevronDown, RefreshCw, Sparkles, Loader2 } from 'lucide-react'
import { adminApi } from '@/lib/api'
import type { CatalogGroup, Category } from '@/lib/api'

interface TMDBMovie {
  id: number
  title: string
  originalTitle: string
  overview: string
  posterUrl: string | null
  backdropUrl: string | null
  releaseDate: string
  voteAverage: number
}

export default function TicketsPage() {
  const [groups, setGroups]         = useState<CatalogGroup[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery]           = useState('')
  const [activeCat, setActiveCat]   = useState(0)
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)

  const [modal, setModal]   = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<CatalogGroup | null>(null)
  const [form, setForm]     = useState({ name: '', description: '', thumbnail_url: '', color: '', category_id: '' })
  const [saving, setSaving] = useState(false)

  // TMDB 검색
  const [tmdbModal, setTmdbModal] = useState(false)
  const [tmdbQuery, setTmdbQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState<TMDBMovie[]>([])
  const [tmdbLoading, setTmdbLoading] = useState(false)

  useEffect(() => {
    adminApi.categoriesTree().then((tree: Category[]) => {
      const flat: Category[] = []
      const walk = (list: Category[]) => list.forEach(c => { flat.push(c); if (c.children) walk(c.children) })
      walk(tree)
      setCategories(flat)
    }).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.groups(1, 200, activeCat || undefined)
      setGroups(data.data || [])
      setTotal(data.total || 0)
    } catch { setGroups([]) }
    finally { setLoading(false) }
  }, [activeCat])

  useEffect(() => { load() }, [load])

  const filtered = groups.filter(g => !query || g.name.toLowerCase().includes(query.toLowerCase()))

  const openCreate = () => {
    setForm({ name: '', description: '', thumbnail_url: '', color: '', category_id: activeCat ? String(activeCat) : '' })
    setEditing(null); setModal('create')
  }
  const openEdit = (g: CatalogGroup) => {
    setForm({ name: g.name, description: g.description || '', thumbnail_url: g.thumbnail_url || '', color: g.color || '', category_id: String(g.category_id) })
    setEditing(g); setModal('edit')
  }
  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = { name: form.name, description: form.description, thumbnail_url: form.thumbnail_url, color: form.color, category_id: form.category_id ? Number(form.category_id) : undefined }
      if (modal === 'edit' && editing) await adminApi.updateGroup(editing.id, payload)
      else await adminApi.createGroup(payload)
      await load(); setModal(null)
    } finally { setSaving(false) }
  }
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 을(를) 삭제할까요?`)) return
    await adminApi.deleteGroup(id).catch(() => null)
    await load()
  }

  // TMDB 검색 실행
  const handleTmdbSearch = async () => {
    if (!tmdbQuery.trim()) return
    setTmdbLoading(true)
    try {
      const data = await adminApi.tmdbSearch(tmdbQuery)
      setTmdbResults(data.results || [])
    } catch (error) {
      console.error('TMDB search error:', error)
      alert('TMDB 검색 중 오류가 발생했습니다. TMDB API 키가 설정되어 있는지 확인하세요.')
    } finally {
      setTmdbLoading(false)
    }
  }

  // TMDB 결과 선택
  const handleSelectTmdb = (movie: TMDBMovie) => {
    setForm(prev => ({
      ...prev,
      name: movie.title,
      description: movie.overview,
      thumbnail_url: movie.backdropUrl || movie.posterUrl || '',
    }))
    setTmdbModal(false)
    setTmdbQuery('')
    setTmdbResults([])
  }

  const catTabs = categories.filter(c => c.depth <= 1).slice(0, 12)

  return (
    <div>
      {/* Page header */}
      <div className="ph">
        <div>
          <h1>수집품 관리</h1>
          <div className="ph-sub">등록된 작품 및 수집품 목록</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={13} className={loading ? 'spin' : ''} /></button>
          <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14} />새 수집품</button>
        </div>
      </div>

      <div className="panel">
        {/* Toolbar */}
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="search" style={{ minWidth: 200, flex: 1 }}>
            <Search size={13} color="var(--txt-3)" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="작품명 검색..." />
            {query && <X size={13} style={{ cursor: 'pointer', color: 'var(--txt-3)' }} onClick={() => setQuery('')} />}
          </div>
          <div className="tabs">
            <button className={`tab ${activeCat === 0 ? 'on' : ''}`} onClick={() => setActiveCat(0)}>전체</button>
            {catTabs.map(c => (
              <button key={c.id} className={`tab ${activeCat === c.id ? 'on' : ''}`} onClick={() => setActiveCat(c.id)}>{c.name}</button>
            ))}
          </div>
          <span className="panel-count">{total.toLocaleString()}</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="empty"><div className="empty-title">로딩 중...</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <Film size={32} className="empty-icon" />
            <div className="empty-title">수집품이 없어요</div>
            <div className="empty-sub">새 수집품을 등록해보세요</div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 46 }}></th>
                <th>작품명</th>
                <th>카테고리</th>
                <th>수집 수</th>
                <th>상태</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id}>
                  <td className="no-label" data-label="">
                    <div className="tbl-thumb-box">
                      {g.thumbnail_url
                        ? <img src={g.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Film size={16} color="var(--txt-3)" />}
                    </div>
                  </td>
                  <td data-label="작품명">
                    <div className="cell-name">{g.name}</div>
                    {g.description && <div className="cell-sub" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.description}</div>}
                  </td>
                  <td data-label="카테고리">
                    {g.category
                      ? <span className="badge badge-gold">{g.category.name}</span>
                      : <span className="badge badge-muted">미분류</span>}
                  </td>
                  <td data-label="수집 수">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} color="var(--txt-3)" />
                      <span className="cell-mono">{g.ticket_count}</span>
                    </span>
                  </td>
                  <td data-label="상태">
                    <span className={`badge ${g.status === 'published' ? 'badge-green' : 'badge-muted'}`}>
                      {g.status === 'published' ? 'published' : g.status}
                    </span>
                  </td>
                  <td className="no-label">
                    <div className="cell-actions">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(g)} title="수정"><Edit2 size={13} /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(g.id, g.name)} title="삭제"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FAB (mobile) */}
      <button className="fab" onClick={openCreate}><Plus size={20} /></button>

      {/* Modal */}
      {modal && (
        <div className="backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{modal === 'edit' ? '수집품 수정' : '새 수집품 등록'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}><X size={15} /></button>
            </div>
            <div className="modal-body">
              {form.thumbnail_url && (
                <div style={{ width: '100%', height: 90, borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 14, background: form.color || 'var(--bg3)' }}>
                  <img src={form.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* TMDB 검색 버튼 */}
              <button
                className="btn btn-ghost"
                onClick={() => setTmdbModal(true)}
                style={{ width: '100%', marginBottom: 14, justifyContent: 'center', gap: 6 }}
              >
                <Sparkles size={14} />
                TMDB에서 검색
              </button>

              <div className="field">
                <label className="lbl">작품명 *</label>
                <input className="inp" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="오징어 게임" />
              </div>
              <div className="field">
                <label className="lbl">설명</label>
                <input className="inp" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="간단한 설명" />
              </div>
              <div className="field">
                <label className="lbl">썸네일 URL</label>
                <input className="inp" value={form.thumbnail_url} onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 42px', gap: 8 }} className="field">
                <div>
                  <label className="lbl">색상 (hex)</label>
                  <input className="inp" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} placeholder="#1C1917" />
                </div>
                {form.color && (
                  <div style={{ width: 42, height: 38, borderRadius: 'var(--r)', background: form.color, border: '1px solid var(--border)', alignSelf: 'flex-end' }} />
                )}
              </div>
              <div className="field">
                <label className="lbl">카테고리</label>
                <div style={{ position: 'relative' }}>
                  <select className="inp" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                    <option value="">카테고리 선택</option>
                    {categories.filter(c => c.depth === 2).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} color="var(--txt-3)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>취소</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.name.trim() || saving}>{saving ? '저장 중...' : '저장'}</button>
            </div>
          </div>
        </div>
      )}

      {/* TMDB 검색 모달 */}
      {tmdbModal && (
        <div className="backdrop" onClick={() => setTmdbModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-head">
              <span className="modal-title">TMDB 영화 검색</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setTmdbModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-body">
              {/* 검색 입력 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div className="search" style={{ flex: 1 }}>
                  <Search size={13} color="var(--txt-3)" />
                  <input
                    value={tmdbQuery}
                    onChange={e => setTmdbQuery(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleTmdbSearch()}
                    placeholder="영화 제목 검색..."
                  />
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleTmdbSearch} disabled={tmdbLoading}>
                  {tmdbLoading ? <Loader2 size={13} className="spin" /> : <Search size={13} />}
                  검색
                </button>
              </div>

              {/* 검색 결과 */}
              {tmdbLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--txt-3)' }}>
                  <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 13 }}>검색 중...</div>
                </div>
              ) : tmdbResults.length > 0 ? (
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {tmdbResults.map(movie => (
                    <div
                      key={movie.id}
                      onClick={() => handleSelectTmdb(movie)}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: 12,
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        marginBottom: 8,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      {movie.posterUrl && (
                        <div style={{ width: 60, height: 90, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: 'var(--bg3)' }}>
                          <img src={movie.posterUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{movie.title}</div>
                        {movie.originalTitle !== movie.title && (
                          <div style={{ fontSize: 11, color: 'var(--txt-3)', marginBottom: 4 }}>{movie.originalTitle}</div>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--txt-2)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                          {movie.overview || '설명 없음'}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'var(--txt-3)', fontFamily: 'DM Mono' }}>{movie.releaseDate}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--gold)' }}>
                            <Star size={11} fill="var(--gold)" />
                            {movie.voteAverage.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : tmdbQuery ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--txt-3)' }}>
                  <Film size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <div style={{ fontSize: 13 }}>검색 결과가 없습니다</div>
                </div>
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--txt-3)' }}>
                  <Search size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <div style={{ fontSize: 13 }}>영화 제목을 검색해보세요</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
