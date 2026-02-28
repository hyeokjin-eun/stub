'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Save } from 'lucide-react'
import { adminApi } from '@/lib/api'
import type { AppSettings } from '@/lib/api'
import { useToast } from '@/components/Toast'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [form, setForm] = useState({ app_title: '', app_subtitle: '', app_description: '' })
  const { show: toast, node: toastNode } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { router.push('/login'); return }
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getAppSettings()
      setSettings(data)
      setForm({ app_title: data.app_title || '', app_subtitle: data.app_subtitle || '', app_description: data.app_description || '' })
    } catch (e: any) {
      if (e.response?.status === 401 || e.response?.status === 403) router.push('/login')
      else toast('설정 불러오기 실패', 'error')
    } finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminApi.updateAppSettings(form)
      toast('설정이 저장됐어요')
      await loadSettings()
    } catch (e: any) {
      if (e.response?.status === 401 || e.response?.status === 403) { router.push('/login') }
      else toast('저장 실패', 'error')
    } finally { setSaving(false) }
  }

  const isDirty = settings && (
    form.app_title !== (settings.app_title || '') ||
    form.app_subtitle !== (settings.app_subtitle || '') ||
    form.app_description !== (settings.app_description || '')
  )

  return (
    <div>
      <div className="ph">
        <div><h1>앱 설정</h1><div className="ph-sub">앱 기본 정보 관리</div></div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={loadSettings} disabled={loading}><RefreshCw size={13} className={loading ? 'spin' : ''} /></button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || !isDirty || !form.app_title}>
            <Save size={13} />{saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Form */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title">기본 정보</span></div>
          <div style={{ padding: 16 }}>
            {loading ? (
              <div className="empty"><div className="empty-title">로딩 중...</div></div>
            ) : (
              <>
                <div className="field"><label className="lbl">앱 타이틀 *</label><input className="inp" value={form.app_title} onChange={e => setForm(p => ({ ...p, app_title: e.target.value }))} placeholder="OTBOOK" maxLength={50} /></div>
                <div className="field"><label className="lbl">서브타이틀</label><input className="inp" value={form.app_subtitle} onChange={e => setForm(p => ({ ...p, app_subtitle: e.target.value }))} placeholder="당신의 추억을 수집하세요" maxLength={100} /></div>
                <div className="field"><label className="lbl">설명</label><textarea className="inp" value={form.app_description} onChange={e => setForm(p => ({ ...p, app_description: e.target.value }))} placeholder="영화, 공연, 스포츠 티켓을 수집하고 공유하는 플랫폼" /></div>
                {isDirty && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => settings && setForm({ app_title: settings.app_title || '', app_subtitle: settings.app_subtitle || '', app_description: settings.app_description || '' })}>되돌리기</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title">미리보기</span></div>
          <div style={{ padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, letterSpacing: '.1em', lineHeight: 1 }}>
              {form.app_title || 'OTBOOK'}<span style={{ color: 'var(--gold)' }}>BOOK</span>
            </div>
            {form.app_subtitle && <div style={{ fontSize: 13, color: 'var(--txt-3)', marginTop: 8 }}>{form.app_subtitle}</div>}
            {form.app_description && <div style={{ fontSize: 11, color: 'var(--txt-3)', marginTop: 8, lineHeight: 1.7 }}>{form.app_description}</div>}
            <div style={{ marginTop: 16, padding: '8px 12px', background: 'var(--gold-dim)', borderRadius: 'var(--r)', fontSize: 11, color: 'var(--gold)' }}>
              변경 후 클라이언트 새로고침 시 반영됩니다
            </div>
          </div>
        </div>
      </div>
      {toastNode}
    </div>
  )
}
