'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, GripVertical } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { adminApi } from '@/lib/api'
import type { Banner } from '@/lib/api'

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [sheet, setSheet]     = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm]       = useState({ title: '', image_url: '', link_url: '', is_active: true })
  const [saving, setSaving]   = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await adminApi.banners().catch(() => [])
    setBanners(Array.isArray(data) ? data : data.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ title: '', image_url: '', link_url: '', is_active: true })
    setEditing(null); setSheet('create')
  }
  const openEdit = (b: Banner) => {
    setForm({ title: b.title, image_url: b.image_url || '', link_url: b.link_url || '', is_active: b.is_active })
    setEditing(b); setSheet('edit')
  }
  const handleSave = async () => {
    setSaving(true)
    try {
      if (sheet === 'edit' && editing) await adminApi.updateBanner(editing.id, form)
      else await adminApi.createBanner(form)
      await load(); setSheet(null)
    } finally { setSaving(false) }
  }
  const handleDelete = async (id: number) => {
    if (!confirm('배너를 삭제할까요?')) return
    await adminApi.deleteBanner(id).catch(() => null)
    await load()
  }
  const toggleActive = async (b: Banner) => {
    await adminApi.updateBanner(b.id, { is_active: !b.is_active }).catch(() => null)
    await load()
  }

  return (
    <div className="admin-container">
      <div className="admin-main" style={{ padding: '0 16px' }}>
        <div style={{ padding: '16px 0 12px', fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: '.06em' }}>
          배너 <span style={{ color: 'var(--gold)' }}>관리</span>
        </div>

        {loading ? (
          <div className="a-empty"><div className="a-empty-title">로딩 중...</div></div>
        ) : banners.length === 0 ? (
          <div className="a-empty">
            <div className="a-empty-title">등록된 배너가 없어요</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {banners.map(b => (
              <div key={b.id} className="a-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {b.image_url && (
                  <img src={b.image_url} alt={b.title}
                    style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <GripVertical size={16} color="var(--txt-muted)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{b.title || '제목 없음'}</div>
                    {b.link_url && <div style={{ fontSize: 11, color: 'var(--txt-muted)', marginTop: 2 }}>{b.link_url}</div>}
                  </div>
                  <div className={`a-toggle ${b.is_active ? 'on' : ''}`} onClick={() => toggleActive(b)} />
                  <div onClick={() => openEdit(b)} style={{ padding: 6, color: 'var(--txt-muted)', cursor: 'pointer' }}>
                    <Edit2 size={15} />
                  </div>
                  <div onClick={() => handleDelete(b.id)} style={{ padding: 6, color: 'var(--red)', cursor: 'pointer' }}>
                    <Trash2 size={15} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="a-fab" onClick={openCreate}><Plus size={22} /></button>

      {sheet && (
        <div className="a-backdrop" onClick={() => setSheet(null)}>
          <div className="a-sheet" onClick={e => e.stopPropagation()}>
            <div className="a-sheet-handle" />
            <div className="a-sheet-title">{sheet === 'edit' ? '배너 수정' : '새 배너 등록'}</div>

            <label className="a-label">제목</label>
            <input className="a-input" style={{ marginBottom: 12 }} value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="배너 제목" />

            <label className="a-label">이미지 URL</label>
            <input className="a-input" style={{ marginBottom: 12 }} value={form.image_url}
              onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />

            <label className="a-label">링크 URL</label>
            <input className="a-input" style={{ marginBottom: 16 }} value={form.link_url}
              onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))} placeholder="/catalog/1" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 14 }}>활성화</span>
              <div className={`a-toggle ${form.is_active ? 'on' : ''}`}
                onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="a-btn a-btn-ghost" style={{ flex: 1 }} onClick={() => setSheet(null)}>취소</button>
              <button className="a-btn a-btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
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
