'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import type { AppSettings } from '@/lib/api'
import BottomNav from '@/components/BottomNav'
import PageHeader from '@/components/PageHeader'
import { useToast } from '@/components/Toast'
import { RefreshCw } from 'lucide-react'

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
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminApi.updateAppSettings(form)
      toast('설정이 저장됐어요')
      await loadSettings()
    } catch (e: any) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        toast('권한이 없어요', 'error'); router.push('/login')
      } else {
        toast('저장 실패', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const isDirty = settings && (
    form.app_title !== (settings.app_title || '') ||
    form.app_subtitle !== (settings.app_subtitle || '') ||
    form.app_description !== (settings.app_description || '')
  )

  return (
    <div className="admin-container">
      <PageHeader title="앱" gold="설정" onRefresh={loadSettings} refreshing={loading} />

      <div className="admin-main" style={{ padding: '16px 16px 0' }}>
        {loading ? (
          <div className="a-empty"><div className="a-empty-title">로딩 중...</div></div>
        ) : (
          <>
            {/* Form */}
            <div className="a-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="a-label">앱 타이틀 *</label>
                <input className="a-input" value={form.app_title}
                  onChange={e => setForm(p => ({ ...p, app_title: e.target.value }))}
                  placeholder="OTBOOK" maxLength={50} />
                <div style={{ fontSize: 11, color: 'var(--txt-muted)', marginTop: 4 }}>헤더 로고에 표시되는 타이틀 (최대 50자)</div>
              </div>

              <div>
                <label className="a-label">서브타이틀</label>
                <input className="a-input" value={form.app_subtitle}
                  onChange={e => setForm(p => ({ ...p, app_subtitle: e.target.value }))}
                  placeholder="당신의 추억을 수집하세요" maxLength={100} />
              </div>

              <div>
                <label className="a-label">앱 설명</label>
                <textarea className="a-input" value={form.app_description}
                  onChange={e => setForm(p => ({ ...p, app_description: e.target.value }))}
                  placeholder="영화, 공연, 스포츠 티켓을 수집하고 공유하는 플랫폼"
                  style={{ minHeight: 80, resize: 'none', lineHeight: 1.6 }} />
              </div>
            </div>

            {/* 미리보기 */}
            <div className="a-section">미리보기</div>
            <div className="a-card" style={{ textAlign: 'center', padding: '24px 20px' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: '.1em' }}>
                {form.app_title || 'OTBOOK'}<span style={{ color: 'var(--gold)' }}>BOOK</span>
              </div>
              {form.app_subtitle && (
                <div style={{ fontSize: 13, color: 'var(--txt-muted)', marginTop: 6 }}>{form.app_subtitle}</div>
              )}
              {form.app_description && (
                <div style={{ fontSize: 11, color: 'var(--txt-muted)', marginTop: 6, lineHeight: 1.6 }}>{form.app_description}</div>
              )}
            </div>

            {/* 저장 */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                className="a-btn a-btn-ghost"
                style={{ flex: 0 , padding: '11px 16px' }}
                disabled={saving || !isDirty}
                onClick={() => settings && setForm({ app_title: settings.app_title || '', app_subtitle: settings.app_subtitle || '', app_description: settings.app_description || '' })}
              >
                <RefreshCw size={15} />
              </button>
              <button
                className="a-btn a-btn-primary"
                style={{ flex: 1 }}
                onClick={handleSave}
                disabled={saving || !form.app_title || !isDirty}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>

            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', lineHeight: 1.8 }}>
                ✦ 변경 후 클라이언트 새로고침 시 반영돼요
              </div>
            </div>
          </>
        )}
      </div>

      {toastNode}
      <BottomNav />
    </div>
  )
}
