'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Search, X, Trash2, Edit2, Film, ChevronRight,
  RefreshCw, ArrowLeft, Package, User, Eye, EyeOff, BookOpen,
} from 'lucide-react'
import { adminApi } from '@/lib/api'
import type { CatalogGroup, CatalogItem, Category } from '@/lib/api'

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
  const [query, setQuery]           = useState('')
  const [activeCat, setActiveCat]   = useState(0)
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)

  const [modal, setModal]     = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<CatalogGroup | null>(null)
  const [form, setForm]       = useState({ name: '', description: '', thumbnail_url: '', color: '', category_id: '' })
  const [saving, setSaving]   = useState(false)

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
      const data = await adminApi.groups(1, 200, activeCat || undefined)
      setGroups(data.data || []); setTotal(data.total || 0)
    } catch { setGroups([]) }
    finally { setLoading(false) }
  }, [activeCat])

  useEffect(() => { load() }, [load])

  const filtered = groups.filter(g => !query || g.name.toLowerCase().includes(query.toLowerCase()))

  const openCreate = () => {
    setForm({ name: '', description: '', thumbnail_url: '', color: '', category_id: activeCat ? String(activeCat) : '' })
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
    if (!confirm(`"${name}" 카탈로그를 삭제할까요?\n연결된 수집품도 모두 삭제됩니다.`)) return
    await adminApi.deleteGroup(id).catch(() => null)
    await load()
  }

  const catTabs = categories.filter(c => c.depth <= 1).slice(0, 14)

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
          <div className="tabs">
            <button className={`tab ${activeCat === 0 ? 'on' : ''}`} onClick={() => setActiveCat(0)}>전체</button>
            {catTabs.map(c => (
              <button key={c.id} className={`tab ${activeCat === c.id ? 'on' : ''}`} onClick={() => setActiveCat(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
          <span className="panel-count">{total.toLocaleString()}</span>
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
                <label className="lbl">이미지 URL</label>
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
    </div>
  )
}
