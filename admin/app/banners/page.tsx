'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, ImageOff, X, RefreshCw, GripVertical, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/Confirm'
import { adminApi } from '@/lib/api'
import type { Banner } from '@/lib/api'

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm]       = useState({ title: '', image_url: '', link_url: '', is_active: true })
  const [saving, setSaving]   = useState(false)
  const { show: toast, node: toastNode } = useToast()
  const { confirm, node: confirmNode }   = useConfirm()

  const load = async () => {
    setLoading(true)
    const data = await adminApi.banners().catch(() => [])
    setBanners(Array.isArray(data) ? data : data.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm({ title: '', image_url: '', link_url: '', is_active: true }); setEditing(null); setModal('create') }
  const openEdit = (b: Banner) => { setForm({ title: b.title, image_url: b.image_url || '', link_url: b.link_url || '', is_active: b.is_active }); setEditing(b); setModal('edit') }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal === 'edit' && editing) await adminApi.updateBanner(editing.id, form)
      else await adminApi.createBanner(form)
      toast(modal === 'edit' ? '배너가 수정됐어요' : '배너가 등록됐어요')
      await load(); setModal(null)
    } catch { toast('저장 실패', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (b: Banner) => {
    const ok = await confirm('배너 삭제', `"${b.title || '제목 없음'}" 배너를 삭제할까요?`, { danger: true, confirmLabel: '삭제' })
    if (!ok) return
    await adminApi.deleteBanner(b.id).catch(() => null)
    toast('삭제됐어요'); await load()
  }

  const toggleActive = async (b: Banner) => {
    await adminApi.updateBanner(b.id, { is_active: !b.is_active }).catch(() => null)
    await load()
  }

  return (
    <div>
      <div className="ph">
        <div><h1>배너 관리</h1><div className="ph-sub">홈 화면 배너 등록 및 순서 관리</div></div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={13} className={loading ? 'spin' : ''} /></button>
          <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14} />새 배너</button>
        </div>
      </div>

      {loading ? (
        <div className="empty"><div className="empty-title">로딩 중...</div></div>
      ) : banners.length === 0 ? (
        <div className="panel">
          <div className="empty">
            <ImageOff size={32} className="empty-icon" />
            <div className="empty-title">등록된 배너가 없어요</div>
            <div className="empty-sub">새 배너를 추가해보세요</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {banners.map((b, i) => (
            <div key={b.id} className="panel" style={{ overflow: 'hidden' }}>
              {/* Image */}
              <div style={{ position: 'relative', height: 120, background: 'var(--bg3)' }}>
                {b.image_url
                  ? <img src={b.image_url} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageOff size={28} color="var(--txt-3)" /></div>}
                {/* badges */}
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
                  <span style={{ background: 'rgba(0,0,0,.65)', color: '#fff', fontSize: 10, fontFamily: 'DM Mono', padding: '2px 7px', borderRadius: 4 }}>#{i + 1}</span>
                </div>
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <span className={`badge ${b.is_active ? 'badge-green' : 'badge-muted'}`} style={{ background: b.is_active ? 'rgba(74,222,128,.85)' : 'rgba(13,13,15,.75)', backdropFilter: 'blur(4px)' }}>
                    {b.is_active ? '활성' : '비활성'}
                  </span>
                </div>
              </div>

              {/* Info + controls */}
              <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <GripVertical size={14} color="var(--txt-3)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title || '제목 없음'}</div>
                  {b.link_url && (
                    <div style={{ fontSize: 11, color: 'var(--txt-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <ExternalLink size={10} />{b.link_url}
                    </div>
                  )}
                </div>
                <button className={`toggle ${b.is_active ? 'on' : ''}`} onClick={() => toggleActive(b)} />
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(b)}><Edit2 size={13} /></button>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(b)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={openCreate}><Plus size={20} /></button>

      {modal && (
        <div className="backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{modal === 'edit' ? '배너 수정' : '새 배너 등록'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}><X size={15} /></button>
            </div>
            <div className="modal-body">
              {form.image_url && (
                <div style={{ width: '100%', height: 80, borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 14, background: 'var(--bg3)' }}>
                  <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div className="field"><label className="lbl">제목</label><input className="inp" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="메인 배너" /></div>
              <div className="field"><label className="lbl">이미지 URL</label><input className="inp" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." /></div>
              <div className="field"><label className="lbl">링크 URL</label><input className="inp" value={form.link_url} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))} placeholder="/catalog/1" /></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>활성화</span>
                <button className={`toggle ${form.is_active ? 'on' : ''}`} onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>취소</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
            </div>
          </div>
        </div>
      )}

      {toastNode}{confirmNode}
    </div>
  )
}
