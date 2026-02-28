'use client'

import { useState } from 'react'
import { Megaphone, CheckCircle, AlertTriangle } from 'lucide-react'
import { adminApi } from '@/lib/api'

export default function NotifyPage() {
  const [message, setMessage]   = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [sending, setSending]   = useState(false)
  const [result, setResult]     = useState<{ sent: number } | null>(null)

  const handleSend = async () => {
    if (!message.trim()) return
    if (!confirm(`전체 유저에게 공지를 발송할까요?\n\n"${message}"`)) return
    setSending(true); setResult(null)
    try {
      const res = await adminApi.sendNotification({ message: message.trim(), targetUrl: targetUrl.trim() || undefined })
      setResult(res); setMessage(''); setTargetUrl('')
    } catch { alert('발송 실패') }
    finally { setSending(false) }
  }

  return (
    <div>
      <div className="ph">
        <div><h1>공지 발송</h1><div className="ph-sub">전체 유저에게 푸시 알림 발송</div></div>
      </div>

      <div style={{ maxWidth: 560 }}>
        {result && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 'var(--r)', marginBottom: 14, background: 'var(--green-dim)', border: '1px solid rgba(74,222,128,.2)' }}>
            <CheckCircle size={16} color="var(--green)" />
            <span style={{ fontSize: 13, color: 'var(--green)' }}>{result.sent}명에게 발송 완료</span>
          </div>
        )}

        <div className="panel">
          <div className="panel-header">
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={14} color="var(--gold)" />
            </div>
            <div>
              <div className="panel-title">시스템 공지</div>
              <div style={{ fontSize: 11, color: 'var(--txt-3)' }}>전체 유저 알림으로 발송됩니다</div>
            </div>
          </div>
          <div style={{ padding: '16px' }}>
            <div className="field">
              <label className="lbl">공지 내용 *</label>
              <textarea className="inp" style={{ minHeight: 100 }} value={message} onChange={e => setMessage(e.target.value)} placeholder="예: OTBOOK 서비스 점검 안내입니다..." />
            </div>
            <div className="field">
              <label className="lbl">링크 URL (선택)</label>
              <input className="inp" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="/catalog 또는 https://..." />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 12px', borderRadius: 'var(--r)', background: 'var(--red-dim)', border: '1px solid rgba(224,82,82,.15)' }}>
              <AlertTriangle size={13} color="var(--red)" />
              <span style={{ fontSize: 11, color: 'var(--red)' }}>발송 후 취소가 불가능해요. 내용을 꼭 확인하세요.</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
              onClick={handleSend} disabled={!message.trim() || sending}>
              <Megaphone size={14} />{sending ? '발송 중...' : '전체 유저에게 발송'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
