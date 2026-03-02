'use client'

import { useEffect, useState } from 'react'
import { Save, RefreshCw } from 'lucide-react'
import { adminApi, AppSettings } from '@/lib/api'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getAppSettings()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      alert('설정을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const updated = await adminApi.updateAppSettings({
        app_title: settings.app_title,
        app_subtitle: settings.app_subtitle,
        app_description: settings.app_description,
        ads_enabled: settings.ads_enabled,
      })
      setSettings(updated)
      alert('설정이 저장되었습니다.')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('설정 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="ph">
        <h1>앱 설정</h1>
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--txt-3)' }}>
          로딩 중...
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="ph">
        <h1>앱 설정</h1>
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--txt-3)' }}>
          설정을 불러올 수 없습니다.
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="ph">
        <div>
          <h1>앱 설정</h1>
          <div className="ph-sub">앱 기본 정보 및 기능 관리</div>
        </div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            새로고침
          </button>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            <Save size={13} />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <div className="panel">
        <div style={{ padding: '20px 24px' }}>
          {/* App Title */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--txt-2)' }}>
              앱 타이틀
            </label>
            <input
              type="text"
              value={settings.app_title}
              onChange={(e) => setSettings({ ...settings, app_title: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 13,
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                background: 'var(--surface)',
                color: 'var(--txt)',
              }}
            />
          </div>

          {/* App Subtitle */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--txt-2)' }}>
              앱 서브타이틀
            </label>
            <input
              type="text"
              value={settings.app_subtitle || ''}
              onChange={(e) => setSettings({ ...settings, app_subtitle: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 13,
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                background: 'var(--surface)',
                color: 'var(--txt)',
              }}
            />
          </div>

          {/* App Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--txt-2)' }}>
              앱 설명
            </label>
            <textarea
              value={settings.app_description || ''}
              onChange={(e) => setSettings({ ...settings, app_description: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 13,
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                background: 'var(--surface)',
                color: 'var(--txt)',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Ads Enabled Toggle */}
          <div style={{
            marginBottom: 20,
            padding: '16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            background: 'var(--surface)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>광고 표시</div>
                <div style={{ fontSize: 11, color: 'var(--txt-3)' }}>
                  클라이언트 앱에서 광고 영역을 표시합니다
                </div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, ads_enabled: !settings.ads_enabled })}
                style={{
                  position: 'relative',
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  border: 'none',
                  background: settings.ads_enabled ? '#4ade80' : '#525252',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: settings.ads_enabled ? 22 : 2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>
            <div style={{
              marginTop: 12,
              padding: '8px 12px',
              fontSize: 11,
              background: settings.ads_enabled ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: settings.ads_enabled ? '#4ade80' : '#ef4444',
              borderRadius: 'var(--r)',
              fontFamily: 'DM Mono',
            }}>
              {settings.ads_enabled ? '✓ 광고 활성화됨' : '✗ 광고 비활성화됨'}
            </div>
          </div>

          {/* Info */}
          <div style={{
            padding: '12px 14px',
            fontSize: 11,
            color: 'var(--txt-3)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
          }}>
            💡 변경사항은 저장 버튼을 눌러야 적용됩니다. 클라이언트 앱은 자동으로 새로운 설정을 반영합니다.
          </div>
        </div>
      </div>
    </div>
  )
}
