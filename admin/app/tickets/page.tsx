'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, X, ChevronLeft, Trash2, Edit2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { adminApi } from '@/lib/api'
import type { CatalogGroup } from '@/lib/api'

export default function TicketsPage() {
  const [groups, setGroups]     = useState<CatalogGroup[]>([])
  const [query, setQuery]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [sheet, setSheet]       = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing]   = useState<CatalogGroup | null>(null)
  const [form, setForm]         = useState({ title: '', description: '', image_url: '', color: '' })
  const [saving, setSaving]     = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await adminApi.groups(1, 100).catch(() => ({ data: [] }))
    setGroups(data.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = groups.filter(g =>
    !query || g.title.toLowerCase().includes(query.toLowerCase())
  )

  const openCreate = () => {
    setForm({ title: '', description: '', image_url: '', color: '' })
    setEditing(null)
    setSheet('create')
  }

  const openEdit = (g: CatalogGroup) => {
    setForm({ title: g.title, description: g.description || '', image_url: g.image_url || '', color: g.color || '' })
    setEditing(g)
    setSheet('edit')
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (sheet === 'edit' && editing) {
        await adminApi.updateGroup(editing.id, form)
      } else {
        await adminApi.createGroup(form)
      }
      await load()
      setSheet(null)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제할까요?')) return
    await adminApi.deleteGroup(id).catch(() => null)
    await load()
  }

  return (
    <div className="admin-container">
      <div className="admin-main" style={{ padding: '0 16px' }}>
        <div style={{ padding: '16px 0 12px', fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: '.06em' }}>
          티켓 <span style={{ color: 'var(--gold)' }}>관리</span>
        </div>

        <div className="a-search">
          <Search size={14} color="var(--txt-muted)" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="컬렉션 그룹 검색..." />
          {query && <X size={14} color="var(--txt-muted)" style={{ cursor: 'pointer' }} onClick={() => setQuery('')} />}
        </div>

        {loading ? (
          <div className="a-empty"><div className="a-empty-title">로딩 중...</div></div>
        ) : filtered.length === 0 ? (
          <div className="a-empty">
            <div className="a-empty-title">그룹이 없어요</div>
            <div className="a-empty-sub">+ 버튼으로 추가해보세요</div>
          </div>
        ) : (
          <div className="a-list">
            {filtered.map(g => (
              <div key={g.id} className="a-row">
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                  background: g.color || 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {g.image_url
                    ? <img src={g.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 18 }}>🎫</span>
                  }
                </div>
                <div className="a-row-body">
                  <div className="a-row-title">{g.title}</div>
                  <div className="a-row-sub">{g.category?.name || '카테고리 없음'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div onClick={() => openEdit(g)} style={{ padding: 6, color: 'var(--txt-muted)', cursor: 'pointer' }}>
                    <Edit2 size={15} />
                  </div>
                  <div onClick={() => handleDelete(g.id)} style={{ padding: 6, color: 'var(--red)', cursor: 'pointer' }}>
                    <Trash2 size={15} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="a-fab" onClick={openCreate}><Plus size={22} /></button>

      {/* Bottom Sheet */}
      {sheet && (
        <div className="a-backdrop" onClick={() => setSheet(null)}>
          <div className="a-sheet" onClick={e => e.stopPropagation()}>
            <div className="a-sheet-handle" />
            <div className="a-sheet-title">{sheet === 'edit' ? '그룹 수정' : '새 그룹 등록'}</div>

            <label className="a-label">그룹 이름 *</label>
            <input className="a-input" style={{ marginBottom: 12 }} value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="예: 마블 시네마틱 유니버스" />

            <label className="a-label">설명</label>
            <input className="a-input" style={{ marginBottom: 12 }} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="간단한 설명" />

            <label className="a-label">이미지 URL</label>
            <input className="a-input" style={{ marginBottom: 12 }} value={form.image_url}
              onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />

            <label className="a-label">대표 색상 (hex)</label>
            <input className="a-input" style={{ marginBottom: 20 }} value={form.color}
              onChange={e => setForm(p => ({ ...p, color: e.target.value }))} placeholder="#c9a84c" />

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="a-btn a-btn-ghost" style={{ flex: 1 }} onClick={() => setSheet(null)}>취소</button>
              <button className="a-btn a-btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={!form.title.trim() || saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
