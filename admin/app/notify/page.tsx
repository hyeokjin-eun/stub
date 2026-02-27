'use client'

import { useState } from 'react'
import { Megaphone, CheckCircle } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { adminApi } from '@/lib/api'

export default function NotifyPage() {
  const [message, setMessage]     = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [sending, setSending]     = useState(false)
  const [result, setResult]       = useState<{ sent: number } | null>(null)

  const handleSend = async () => {
    if (!message.trim()) return
    if (!confirm(`전체 유저에게 공지를 발송할까요?\n\n"${message}"`)) return
    setSending(true)
    setResult(null)
    try {
      const res = await adminApi.sendNotification({ message: message.trim(), targetUrl: targetUrl.trim() || undefined })
      setResult(res)
      setMessage('')
      setTargetUrl('')
    } catch {
      alert('발송 실패. 로그인 상태를 확인해주세요.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-main" style={{ padding: '0 16px' }}>
        <div style={{ padding: '16px 0 20px', fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: '.06em' }}>
          공지 <span style={{ color: 'var(--gold)' }}>발송</span>
        </div>

        {result && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 16px', borderRadius: 12, marginBottom: 16,
            background: 'rgba(46,204,113,.1)', border: '1px solid rgba(46,204,113,.3)',
          }}>
            <CheckCircle size={18} color="var(--green)" />
            <span style={{ fontSize: 14, color: 'var(--green)' }}>{result.sent}명에게 공지를 발송했어요</span>
          </div>
        )}

        <div className="a-card">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={18} color="var(--gold)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>시스템 공지</div>
              <div style={{ fontSize: 11, color: 'var(--txt-muted)' }}>전체 유저 알림으로 발송됩니다</div>
            </div>
          </div>

          <label className="a-label">공지 내용 *</label>
          <textarea
            className="a-input"
            style={{ marginBottom: 12, minHeight: 100, resize: 'none', lineHeight: 1.6 }}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="예: OTBOOK 서비스 점검 안내입니다..."
          />

          <label className="a-label">링크 URL (선택)</label>
          <input
            className="a-input"
            style={{ marginBottom: 20 }}
            value={targetUrl}
            onChange={e => setTargetUrl(e.target.value)}
            placeholder="/catalog 또는 https://..."
          />

          <div style={{ fontSize: 12, color: 'var(--txt-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            ⚠ 발송 후 취소가 불가능해요. 내용을 꼭 확인해주세요.
          </div>

          <button
            className="a-btn a-btn-primary"
            style={{ width: '100%' }}
            onClick={handleSend}
            disabled={!message.trim() || sending}
          >
            <Megaphone size={16} />
            {sending ? '발송 중...' : '전체 유저에게 발송'}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
