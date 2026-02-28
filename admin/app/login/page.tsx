'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { adminApi } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email || !password) return
    setLoading(true); setError('')
    try {
      const res = await adminApi.login(email, password)
      const token = res.access_token || res.token
      if (!token) { setError('로그인 정보가 올바르지 않아요'); return }
      localStorage.setItem('admin_token', token)
      document.cookie = `admin_token=${token}; path=/; max-age=86400`
      router.push('/')
    } catch {
      setError('이메일 또는 비밀번호를 확인해주세요')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 14, background: 'var(--gold-dim)', border: '1px solid rgba(212,168,75,.25)', marginBottom: 14 }}>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'var(--gold)', letterSpacing: '.06em' }}>OT</span>
          </div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, letterSpacing: '.1em' }}>
            OT<span style={{ color: 'var(--gold)' }}>BOOK</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--txt-3)', marginTop: 4, fontFamily: 'DM Mono', letterSpacing: '.08em' }}>ADMIN CONSOLE</div>
        </div>

        {/* Card */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title">관리자 로그인</span></div>
          <form onSubmit={handleLogin} style={{ padding: 20 }}>
            {error && (
              <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 'var(--r)', background: 'var(--red-dim)', border: '1px solid rgba(224,82,82,.2)', fontSize: 13, color: 'var(--red)' }}>
                {error}
              </div>
            )}
            <div className="field">
              <label className="lbl">이메일</label>
              <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@otbook.app" autoComplete="email" required />
            </div>
            <div className="field">
              <label className="lbl">비밀번호</label>
              <div style={{ position: 'relative' }}>
                <input className="inp" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight: 40 }} autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 18, justifyContent: 'center', padding: '10px' }}
              disabled={loading || !email || !password}>
              <LogIn size={14} />{loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--txt-3)', fontFamily: 'DM Mono' }}>
          OTBOOK Admin v1.0
        </div>
      </div>
    </div>
  )
}
