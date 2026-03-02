'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Search, X, Trash2, Edit2, Film, ChevronRight,
  RefreshCw, ArrowLeft, Package, User, Eye, EyeOff, BookOpen,
  Sparkles, Loader2, Star,
} from 'lucide-react'
import { adminApi } from '@/lib/api'
import type { CatalogGroup, CatalogItem, Category } from '@/lib/api'

interface TMDBMovie {
  id: number
  mediaType: 'movie' | 'tv'
  title: string
  originalTitle: string
  overview: string
  posterUrl: string | null
  backdropUrl: string | null
  releaseDate: string
  voteAverage: number
}

// ─── 상태 뱃지 ──────────────────────────────────────────────────
const STATUS_CLS: Record<string, string> = {
  watched: 'badge-green', watching: 'badge-blue', plan: 'badge-gold',
  collected: 'badge-blue', wish: 'badge-gold', trading: 'badge-purple',
  rewatched: 'badge-purple', dropped: 'badge-red',
}
const STATUS_LABEL: Record<string, string> = {
  watched: '시청 완료', watching: '시청 중', plan: '볼 예정',
  collected: '수집 완료', wish: '갖고 싶다', trading: '교환 중',
  rewatched: '재시청', dropped: '하차',
}
const ITEM_STATUS_OPTIONS = ['watched', 'watching', 'plan', 'collected', 'wish', 'trading', 'rewatched', 'dropped']
const ITEM_TYPES = [
  { value: 'VIEWING',      label: '시청 기록' },
  { value: 'TICKET',       label: '티켓' },
  { value: 'TRADING_CARD', label: '트레이딩 카드' },
  { value: 'GOODS',        label: '굿즈' },
]

type View = 'catalog' | 'items'

export default function WorksPage() {
  const [view, setView]   = useState<View>('catalog')
  const [group, setGroup] = useState<CatalogGroup | null>(null)

  const drillDown = (g: CatalogGroup) => { setGroup(g); setView('items') }
  const goBack    = ()                 => { setGroup(null); setView('catalog') }

  return view === 'catalog'
    ? <CatalogList onDrillDown={drillDown} />
    : <ItemsList group={group!} onBack={goBack} />
}

/* ══════════════════════════════════════════════════════════════
   카탈로그 목록 (CatalogGroup)
══════════════════════════════════════════════════════════════ */
function CatalogList({ onDrillDown }: { onDrillDown: (g: CatalogGroup) => void }) {
  const [groups, setGroups]         = useState<CatalogGroup[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryTree, setCategoryTree] = useState<Category[]>([])
  const [query, setQuery]           = useState('')
  const [activeItemType, setActiveItemType] = useState<string>('')
  const [activeDepth0, setActiveDepth0] = useState<number>(0)  // 대분류
  const [activeDepth1, setActiveDepth1] = useState<number>(0)  // 중분류
  const [activeDepth2, setActiveDepth2] = useState<number>(0)  // 소분류
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)

  const [modal, setModal]     = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<CatalogGroup | null>(null)
  const [form, setForm]       = useState({ name: '', description: '', thumbnail_url: '', color: '', category_id: '' })
  const [saving, setSaving]   = useState(false)

  // TMDB 검색
  const [tmdbModal, setTmdbModal] = useState(false)
  const [tmdbQuery, setTmdbQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState<TMDBMovie[]>([])
  const [tmdbLoading, setTmdbLoading] = useState(false)
  const [tmdbImageType, setTmdbImageType] = useState<'poster' | 'backdrop'>('backdrop')

  useEffect(() => {
    adminApi.categoriesTree().then((tree: Category[]) => {
      setCategoryTree(tree)
      // flat 리스트도 만들어둠
      const flat: Category[] = []
      const walk = (list: Category[]) => list.forEach(c => { flat.push(c); if (c.children) walk(c.children) })
      walk(tree); setCategories(flat)
    }).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // 모든 그룹을 가져와서 클라이언트 사이드 필터링
      const data = await adminApi.groups(1, 500, undefined, activeItemType || undefined)
      setGroups(data.data || []); setTotal(data.total || 0)
    } catch { setGroups([]) }
    finally { setLoading(false) }
  }, [activeItemType])

  useEffect(() => { load() }, [load])

  const filtered = groups.filter(g => {
    // 검색어 필터
    if (query && !g.name.toLowerCase().includes(query.toLowerCase())) return false

    const groupCategory = g.category
    if (!groupCategory) return false

    // 카테고리 계층 구조 파악
    const leaf = groupCategory  // depth=2
    const middle = leaf.parent  // depth=1
    const root = middle?.parent || middle  // depth=0

    // 대분류 필터
    if (activeDepth0 !== 0 && root?.id !== activeDepth0) return false

    // 중분류 필터
    if (activeDepth1 !== 0 && middle?.id !== activeDepth1) return false

    // 소분류 필터
    if (activeDepth2 !== 0 && leaf.id !== activeDepth2) return false

    return true
  })

  const openCreate = () => {
    setForm({ name: '', description: '', thumbnail_url: '', color: '', category_id: activeDepth2 ? String(activeDepth2) : '' })
    setEditing(null); setModal('create')
  }
  const openEdit = (g: CatalogGroup, e: React.MouseEvent) => {
    e.stopPropagation()
    setForm({ name: g.name, description: g.description || '', thumbnail_url: g.thumbnail_url || '', color: g.color || '', category_id: String(g.category_id) })
    setEditing(g); setModal('edit')
  }
  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name, description: form.description,
        thumbnail_url: form.thumbnail_url, color: form.color,
        category_id: form.category_id ? Number(form.category_id) : undefined,
      }
      if (modal === 'edit' && editing) await adminApi.updateGroup(editing.id, payload)
      else await adminApi.createGroup(payload)
      await load(); setModal(null)
    } finally { setSaving(false) }
  }
  const handleDelete = async (id: number, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`"${name}" 카탈로그를 삭제할까요?\n연결된 수집품은 그룹 없음 상태가 됩니다.`)) return
    try {
      await adminApi.deleteGroup(id)
      await load()
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제 실패')
    }
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
    const imageUrl = tmdbImageType === 'poster'
      ? (movie.posterUrl || movie.backdropUrl || '')
      : (movie.backdropUrl || movie.posterUrl || '')

    setForm(prev => ({
      ...prev,
      name: movie.title,
      description: movie.overview,
      thumbnail_url: imageUrl,
    }))
    setTmdbModal(false)
    setTmdbQuery('')
    setTmdbResults([])
  }

  // 대분류(depth=0) 카테고리 필터링
  const depth0Categories = categoryTree.filter(c => {
    if (!activeItemType) return true
    return c.item_type === activeItemType
  })

  // 중분류(depth=1) 카테고리 필터링
  const selectedDepth0 = categoryTree.find(c => c.id === activeDepth0)
  const depth1Categories = selectedDepth0?.children || []

  // 소분류(depth=2) 카테고리 필터링
  const selectedDepth1 = depth1Categories.find(c => c.id === activeDepth1)
  const depth2Categories = selectedDepth1?.children || []

  // 아이템타입 변경 시 카테고리 초기화
  const handleItemTypeChange = (type: string) => {
    setActiveItemType(type)
    setActiveDepth0(0)
    setActiveDepth1(0)
    setActiveDepth2(0)
  }

  // 대분류 변경 시 하위 초기화
  const handleDepth0Change = (id: number) => {
    setActiveDepth0(id)
    setActiveDepth1(0)
    setActiveDepth2(0)
  }

  // 중분류 변경 시 소분류 초기화
  const handleDepth1Change = (id: number) => {
    setActiveDepth1(id)
    setActiveDepth2(0)
  }

  return (
    <div>
      <div className="ph">
        <div>
          <h1>카탈로그 관리</h1>
          <div className="ph-sub">등록된 카탈로그 목록 — 클릭하면 수집품을 관리할 수 있어요</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} />새 카탈로그
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="search" style={{ minWidth: 180, flex: 1 }}>
            <Search size={13} color="var(--txt-3)" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="카탈로그명 검색..." />
            {query && <X size={13} style={{ cursor: 'pointer', color: 'var(--txt-3)' }} onClick={() => setQuery('')} />}
          </div>

          {/* 아이템 타입 필터 */}
          <div className="tabs">
            <button className={`tab ${activeItemType === '' ? 'on' : ''}`} onClick={() => handleItemTypeChange('')}>전체타입</button>
            {ITEM_TYPES.map(t => (
              <button key={t.value} className={`tab ${activeItemType === t.value ? 'on' : ''}`} onClick={() => handleItemTypeChange(t.value)}>
                {t.label}
              </button>
            ))}
          </div>

          <span className="panel-count">{filtered.length.toLocaleString()} / {total.toLocaleString()}</span>
        </div>

        {/* 계층적 카테고리 필터 */}
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          {/* 대분류(depth=0) */}
          {depth0Categories.length > 0 && (
            <div className="tabs" style={{ flex: 1 }}>
              <button className={`tab ${activeDepth0 === 0 ? 'on' : ''}`} onClick={() => handleDepth0Change(0)}>전체</button>
              {depth0Categories.map(c => (
                <button key={c.id} className={`tab ${activeDepth0 === c.id ? 'on' : ''}`} onClick={() => handleDepth0Change(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 중분류(depth=1) - 대분류 선택 시에만 표시 */}
        {activeDepth0 !== 0 && depth1Categories.length > 0 && (
          <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <div className="tabs" style={{ flex: 1 }}>
              <button className={`tab ${activeDepth1 === 0 ? 'on' : ''}`} onClick={() => handleDepth1Change(0)}>전체</button>
              {depth1Categories.map(c => (
                <button key={c.id} className={`tab ${activeDepth1 === c.id ? 'on' : ''}`} onClick={() => handleDepth1Change(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 소분류(depth=2) - 중분류 선택 시에만 표시 */}
        {activeDepth1 !== 0 && depth2Categories.length > 0 && (
          <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <div className="tabs" style={{ flex: 1 }}>
              <button className={`tab ${activeDepth2 === 0 ? 'on' : ''}`} onClick={() => setActiveDepth2(0)}>전체</button>
              {depth2Categories.map(c => (
                <button key={c.id} className={`tab ${activeDepth2 === c.id ? 'on' : ''}`} onClick={() => setActiveDepth2(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '0 20px' }}>
          <span style={{ fontSize: 11, color: 'var(--txt-3)' }}>
            필터: {activeItemType || '전체타입'}
            {activeDepth0 !== 0 && ` > ${depth0Categories.find(c => c.id === activeDepth0)?.name}`}
            {activeDepth1 !== 0 && ` > ${depth1Categories.find(c => c.id === activeDepth1)?.name}`}
            {activeDepth2 !== 0 && ` > ${depth2Categories.find(c => c.id === activeDepth2)?.name}`}
          </span>
        </div>

        {loading ? (
          <div className="empty"><div className="empty-title">로딩 중...</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <Film size={32} className="empty-icon" />
            <div className="empty-title">카탈로그가 없어요</div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 46 }}></th>
                <th>카탈로그명</th>
                <th>카테고리</th>
                <th>수집품 수</th>
                <th>상태</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id} onClick={() => onDrillDown(g)}>
                  <td className="no-label">
                    <div className="tbl-thumb-box">
                      {g.thumbnail_url
                        ? <img src={g.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Film size={15} color="var(--txt-3)" />}
                    </div>
                  </td>
                  <td data-label="카탈로그명">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="cell-name">{g.name}</span>
                      <ChevronRight size={11} color="var(--txt-3)" />
                    </div>
                    {g.description && (
                      <div className="cell-sub" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {g.description}
                      </div>
                    )}
                  </td>
                  <td data-label="카테고리">
                    {g.category
                      ? <span className="badge badge-gold">{g.category.name}</span>
                      : <span className="badge badge-muted">미분류</span>}
                  </td>
                  <td data-label="수집품 수">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Package size={11} color="var(--txt-3)" />
                      <span className="cell-mono">{g.ticket_count}</span>
                    </span>
                  </td>
                  <td data-label="상태">
                    <span className={`badge ${g.status === 'published' ? 'badge-green' : 'badge-muted'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="no-label" onClick={e => e.stopPropagation()}>
                    <div className="cell-actions">
                      <button className="btn btn-ghost btn-icon btn-sm" title="수정" onClick={e => openEdit(g, e)}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-danger btn-icon btn-sm" title="삭제" onClick={e => handleDelete(g.id, g.name, e)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button className="fab" onClick={openCreate}><Plus size={20} /></button>

      {/* 카탈로그 등록/수정 모달 */}
      {modal && (
        <div className="backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{modal === 'edit' ? '카탈로그 수정' : '새 카탈로그 등록'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}><X size={15} /></button>
            </div>
            <div className="modal-body">
              {form.thumbnail_url && (
                <div style={{ height: 80, borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 14, background: form.color || 'var(--bg3)' }}>
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
                <label className="lbl">카탈로그명 *</label>
                <input className="inp" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="오징어 게임" />
              </div>
              <div className="field">
                <label className="lbl">설명</label>
                <textarea className="inp" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="작품 간단 설명" />
              </div>
              <div className="field">
                <label className="lbl">썸네일 URL</label>
                <input className="inp" value={form.thumbnail_url} onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 38px', gap: 8 }}>
                <div className="field">
                  <label className="lbl">배경색</label>
                  <input className="inp" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} placeholder="#1C1917" />
                </div>
                {form.color && <div style={{ width: 38, height: 38, borderRadius: 'var(--r)', background: form.color, border: '1px solid var(--border)', alignSelf: 'flex-end' }} />}
              </div>
              <div className="field">
                <label className="lbl">카테고리</label>
                <select className="inp" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                  <option value="">카테고리 선택</option>
                  {categories.filter(c => c.depth === 2).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>취소</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.name.trim() || saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TMDB 검색 모달 */}
      {tmdbModal && (
        <div className="backdrop" onClick={() => setTmdbModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-head">
              <span className="modal-title">TMDB 검색 (영화 + TV)</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setTmdbModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-body">
              {/* 검색 입력 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div className="search" style={{ flex: 1 }}>
                  <Search size={13} color="var(--txt-3)" />
                  <input
                    value={tmdbQuery}
                    onChange={e => setTmdbQuery(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleTmdbSearch()}
                    placeholder="영화/TV 프로그램 제목 검색..."
                  />
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleTmdbSearch} disabled={tmdbLoading}>
                  {tmdbLoading ? <Loader2 size={13} className="spin" /> : <Search size={13} />}
                  검색
                </button>
              </div>

              {/* 이미지 타입 선택 */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, padding: '8px 12px', background: 'var(--bg3)', borderRadius: 'var(--r)', fontSize: 12 }}>
                <span style={{ color: 'var(--txt-3)', fontWeight: 500 }}>사용할 이미지:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="imageType"
                    checked={tmdbImageType === 'backdrop'}
                    onChange={() => setTmdbImageType('backdrop')}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>배경 이미지 (가로)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="imageType"
                    checked={tmdbImageType === 'poster'}
                    onChange={() => setTmdbImageType('poster')}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>포스터 (세로)</span>
                </label>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{movie.title}</div>
                          <span className={`badge ${movie.mediaType === 'movie' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: 9, padding: '2px 6px' }}>
                            {movie.mediaType === 'movie' ? '영화' : 'TV'}
                          </span>
                        </div>
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

/* ══════════════════════════════════════════════════════════════
   수집품 목록 (CatalogItem) — 카탈로그 드릴다운
══════════════════════════════════════════════════════════════ */
function ItemsList({ group, onBack }: { group: CatalogGroup; onBack: () => void }) {
  const [items, setItems]     = useState<CatalogItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal]     = useState(0)
  const [query, setQuery]     = useState('')

  const [modal, setModal]     = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<CatalogItem | null>(null)
  const [form, setForm]       = useState({
    title: '', description: '', status: 'watched',
    item_type: 'VIEWING', category_id: '',
    image_url: '', is_public: true, sort_order: 1,
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  // TMDB 검색
  const [tmdbModal, setTmdbModal] = useState(false)
  const [tmdbQuery, setTmdbQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState<TMDBMovie[]>([])
  const [tmdbLoading, setTmdbLoading] = useState(false)
  const [tmdbImageType, setTmdbImageType] = useState<'poster' | 'backdrop'>('backdrop')

  // 카탈로그의 카테고리 기준으로 depth=2 카테고리 필터
  useEffect(() => {
    adminApi.categoriesTree().then((tree: Category[]) => {
      const flat: Category[] = []
      const walk = (list: Category[]) => list.forEach(c => { flat.push(c); if (c.children) walk(c.children) })
      walk(tree); setCategories(flat)
    }).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.items(group.id, 1, 100)
      setItems(data.data || []); setTotal(data.total || 0)
    } catch { setItems([]) }
    finally { setLoading(false) }
  }, [group.id])

  useEffect(() => { load() }, [load])

  const filtered = items.filter(i => !query || i.title.toLowerCase().includes(query.toLowerCase()))

  const openCreate = () => {
    // 카탈로그 카테고리 기본 선택
    setForm({
      title: '', description: '', status: 'watched',
      item_type: 'VIEWING',
      category_id: group.category_id ? String(group.category_id) : '',
      image_url: group.thumbnail_url || '', is_public: true, sort_order: (total + 1),
    })
    setEditing(null); setErr(''); setModal('create')
  }

  const openEdit = (item: CatalogItem) => {
    setForm({
      title: item.title, description: item.description || '',
      status: item.status, item_type: 'VIEWING',
      category_id: String(item.category_id),
      image_url: item.image_url || '',
      is_public: item.is_public, sort_order: item.sort_order,
    })
    setEditing(item); setErr(''); setModal('edit')
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setErr('제목을 입력하세요'); return }
    if (!form.category_id) { setErr('카테고리를 선택하세요'); return }
    setSaving(true); setErr('')
    try {
      if (modal === 'edit' && editing) {
        await adminApi.updateItem(editing.id, {
          title: form.title, description: form.description,
          status: form.status, image_url: form.image_url,
          is_public: form.is_public, sort_order: form.sort_order,
        })
      } else {
        await adminApi.createItem({
          title: form.title, description: form.description,
          item_type: form.item_type,
          category_id: Number(form.category_id),
          catalog_group_id: group.id,
          status: form.status, image_url: form.image_url,
          is_public: form.is_public, sort_order: form.sort_order,
          metadata: { type: form.item_type },
        })
      }
      await load(); setModal(null)
    } catch (e: any) {
      setErr(e.response?.data?.message || '저장 실패')
    } finally { setSaving(false) }
  }

  const handleDelete = async (item: CatalogItem) => {
    if (!confirm(`"${item.title}" 수집품을 삭제할까요?`)) return
    try {
      await adminApi.deleteItem(item.id)
      await load()
    } catch (e: any) {
      alert(e.response?.data?.message || '삭제 실패')
    }
  }

  // TMDB 검색
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
    const imageUrl = tmdbImageType === 'poster'
      ? (movie.posterUrl || movie.backdropUrl || '')
      : (movie.backdropUrl || movie.posterUrl || '')

    setForm(prev => ({
      ...prev,
      title: movie.title,
      description: movie.overview,
      image_url: imageUrl,
    }))
    setTmdbModal(false)
    setTmdbQuery('')
    setTmdbResults([])
  }

  const subCategories = categories.filter(c => c.depth === 2)

  return (
    <div>
      {/* 헤더 */}
      <div className="ph">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ flexShrink: 0 }}>
            <ArrowLeft size={14} />카탈로그 목록
          </button>
          {group.thumbnail_url && (
            <div style={{ width: 38, height: 38, borderRadius: 'var(--r)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
              <img src={group.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 17, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {group.name}
            </h1>
            <div className="ph-sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {group.category && <span className="badge badge-gold" style={{ fontSize: 9 }}>{group.category.name}</span>}
              <span>수집품 {total}개</span>
            </div>
          </div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} />수집품 추가
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="toolbar">
          <div className="search" style={{ flex: 1 }}>
            <Search size={13} color="var(--txt-3)" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="수집품명 검색..." />
            {query && <X size={13} style={{ cursor: 'pointer', color: 'var(--txt-3)' }} onClick={() => setQuery('')} />}
          </div>
          <span className="panel-count">{total}</span>
        </div>

        {loading ? (
          <div className="empty"><div className="empty-title">로딩 중...</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <BookOpen size={32} className="empty-icon" />
            <div className="empty-title">수집품이 없어요</div>
            <div className="empty-sub">
              <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={openCreate}>
                <Plus size={13} />수집품 추가
              </button>
            </div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>수집품명</th>
                <th>소유자</th>
                <th>상태</th>
                <th>공개</th>
                <th>순서</th>
                <th style={{ width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} style={{ cursor: 'default' }}>
                  <td data-label="수집품명">
                    <div className="cell-name">{item.title}</div>
                    {item.description && <div className="cell-sub">{item.description}</div>}
                  </td>
                  <td data-label="소유자">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <User size={11} color="var(--txt-3)" />
                      <span className="cell-mono">{item.owner?.nickname ?? `#${item.owner_id}`}</span>
                    </span>
                  </td>
                  <td data-label="상태">
                    <span className={`badge ${STATUS_CLS[item.status] ?? 'badge-muted'}`}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </td>
                  <td data-label="공개">
                    {item.is_public
                      ? <Eye size={14} color="var(--green)" />
                      : <EyeOff size={14} color="var(--txt-3)" />}
                  </td>
                  <td data-label="순서">
                    <span className="cell-mono">{item.sort_order}</span>
                  </td>
                  <td className="no-label">
                    <div className="cell-actions">
                      <button className="btn btn-ghost btn-icon btn-sm" title="수정" onClick={() => openEdit(item)}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-danger btn-icon btn-sm" title="삭제" onClick={() => handleDelete(item)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FAB (모바일) */}
      <button className="fab" onClick={openCreate}><Plus size={20} /></button>

      {/* 수집품 추가/수정 모달 */}
      {modal && (
        <div className="backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">
                {modal === 'edit' ? '수집품 수정' : `수집품 추가 — ${group.name}`}
              </span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}><X size={15} /></button>
            </div>
            <div className="modal-body">

              {/* 수정 모드: 메타 정보 */}
              {modal === 'edit' && editing && (
                <div style={{ marginBottom: 14, padding: '7px 12px', background: 'var(--bg3)', borderRadius: 'var(--r)', fontSize: 11, color: 'var(--txt-3)', display: 'flex', gap: 12 }}>
                  <span>ID #{editing.id}</span>
                  <span>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={10} />
                    {editing.owner?.nickname ?? `#${editing.owner_id}`}
                  </span>
                </div>
              )}

              {err && (
                <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 'var(--r)', background: 'var(--red-dim)', border: '1px solid rgba(224,82,82,.2)', fontSize: 12, color: 'var(--red)' }}>
                  {err}
                </div>
              )}

              <div className="field">
                <label className="lbl">제목 *</label>
                <input className="inp" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="예: 오징어 게임 시청 완료" />
              </div>

              <div className="field">
                <label className="lbl">설명</label>
                <textarea className="inp" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="간단한 메모" />
              </div>

              {/* 추가 모드에서만 아이템 타입 선택 */}
              {modal === 'create' && (
                <div className="field">
                  <label className="lbl">아이템 타입 *</label>
                  <select className="inp" value={form.item_type}
                    onChange={e => setForm(p => ({ ...p, item_type: e.target.value }))}>
                    {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              )}

              {/* 추가 모드에서만 카테고리 선택 */}
              {modal === 'create' && (
                <div className="field">
                  <label className="lbl">카테고리 *</label>
                  <select className="inp" value={form.category_id}
                    onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                    <option value="">카테고리 선택</option>
                    {subCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="field">
                <label className="lbl">상태</label>
                <select className="inp" value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {ITEM_STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="lbl" style={{ marginBottom: 0 }}>이미지 URL</label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setTmdbModal(true)}
                    style={{ fontSize: 11, padding: '4px 8px', height: 'auto' }}
                  >
                    <Sparkles size={14} />
                    TMDB에서 검색
                  </button>
                </div>
                <input className="inp" value={form.image_url}
                  onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://..." />
              </div>
              {form.image_url && (
                <div style={{ height: 60, borderRadius: 'var(--r)', overflow: 'hidden', marginTop: 6, marginBottom: 2, border: '1px solid var(--border)' }}>
                  <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div className="field">
                <label className="lbl">표시 순서</label>
                <input className="inp" type="number" min={1} value={form.sort_order}
                  onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>공개 여부</span>
                <button className={`toggle ${form.is_public ? 'on' : ''}`}
                  onClick={() => setForm(p => ({ ...p, is_public: !p.is_public }))} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>취소</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : modal === 'edit' ? '저장' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TMDB 검색 모달 */}
      {tmdbModal && (
        <div className="backdrop" onClick={() => setTmdbModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-head">
              <span className="modal-title">TMDB 검색 (영화 + TV)</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setTmdbModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-body">
              {/* 검색 입력 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div className="search" style={{ flex: 1 }}>
                  <Search size={13} color="var(--txt-3)" />
                  <input
                    value={tmdbQuery}
                    onChange={e => setTmdbQuery(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleTmdbSearch()}
                    placeholder="영화/TV 프로그램 제목 검색..."
                  />
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleTmdbSearch} disabled={tmdbLoading}>
                  {tmdbLoading ? <Loader2 size={13} className="spin" /> : <Search size={13} />}
                  검색
                </button>
              </div>

              {/* 이미지 타입 선택 */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, padding: '8px 12px', background: 'var(--bg3)', borderRadius: 'var(--r)', fontSize: 12 }}>
                <span style={{ color: 'var(--txt-3)', fontWeight: 500 }}>사용할 이미지:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="imageTypeItem"
                    checked={tmdbImageType === 'backdrop'}
                    onChange={() => setTmdbImageType('backdrop')}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>배경 이미지 (가로)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="imageTypeItem"
                    checked={tmdbImageType === 'poster'}
                    onChange={() => setTmdbImageType('poster')}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>포스터 (세로)</span>
                </label>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{movie.title}</div>
                          <span className={`badge ${movie.mediaType === 'movie' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: 9, padding: '2px 6px' }}>
                            {movie.mediaType === 'movie' ? '영화' : 'TV'}
                          </span>
                        </div>
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
                  <div style={{ fontSize: 13 }}>영화/TV 프로그램 제목을 검색해보세요</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
