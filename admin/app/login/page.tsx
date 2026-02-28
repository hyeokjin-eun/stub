'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { adminApi } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    try {
      const { access_token } = await adminApi.login(email.trim(), password)
      // 쿠키 + localStorage 동시 저장 (미들웨어는 쿠키, API 클라이언트는 localStorage)
      document.cookie = `admin_token=${access_token}; path=/; max-age=${60 * 60 * 24 * 7}`
      localStorage.setItem('admin_token', access_token)
      router.push('/')
    } catch (e: any) {
      setError(e?.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 24px',
      background: 'var(--bg)',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, letterSpacing: '.1em' }}>
          OT<span style={{ color: 'var(--gold)' }}>BOOK</span>
        </div>
        <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--txt-muted)', marginTop: 4, letterSpacing: '.12em' }}>
          ADMIN CONSOLE
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 360,
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '28px 24px',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>관리자 로그인</div>

        {/* Email */}
        <label className="a-label">이메일</label>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Mail size={15} color="var(--txt-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="a-input"
            style={{ paddingLeft: 38 }}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="admin@otbook.com"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <label className="a-label">비밀번호</label>
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Lock size={15} color="var(--txt-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="a-input"
            style={{ paddingLeft: 38, paddingRight: 40 }}
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
          />
          <div
            onClick={() => setShowPw(p => !p)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--txt-muted)' }}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            fontSize: 12, color: 'var(--red)', marginBottom: 16,
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(224,58,58,.08)', border: '1px solid rgba(224,58,58,.2)',
          }}>
            {error}
          </div>
        )}

        <button
          className="a-btn a-btn-primary"
          style={{ width: '100%' }}
          onClick={handleLogin}
          disabled={!email.trim() || !password.trim() || loading}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </div>

      <div style={{ marginTop: 20, fontSize: 11, color: 'var(--txt-muted)', fontFamily: 'DM Mono, monospace' }}>
        OTBOOK Admin v1.0
      </div>
    </div>
  )
}
