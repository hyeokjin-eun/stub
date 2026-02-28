'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Music, Ticket, Globe } from 'lucide-react'
import { appSettingsApi } from '@/lib/api'

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [deletedNotice, setDeletedNotice] = useState(false)
  const [appTitle, setAppTitle] = useState('OTBOOK')
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('deleted') === 'true') {
      setDeletedNotice(true)
    }

    // App Settings 불러오기
    appSettingsApi.getSettings().then(settings => {
      if (settings?.app_title) {
        setAppTitle(settings.app_title)
      }
    }).catch(() => {
      // 실패 시 기본값 유지
    })
  }, [searchParams])

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      await signIn('google', {
        callbackUrl: '/',
        // 탈퇴 후 재진입이면 Google 계정 선택 강제 → 자동 재로그인 차단
        ...(deletedNotice ? { prompt: 'select_account' } : {}),
      })
    } catch (error) {
      console.error('Login failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="login-shell">
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />
        <div className="bg-glow bg-glow-3" />

        {/* 탈퇴 완료 안내 토스트 */}
        {deletedNotice && (
          <div style={{
            position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--card)', border: '1px solid rgba(201,168,76,.35)',
            borderRadius: 12, padding: '12px 20px', zIndex: 100,
            fontSize: 13, color: 'var(--txt)', textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,.5)', maxWidth: 300, width: '90%',
          }}>
            <div style={{ fontSize: 11, fontFamily: 'DM Mono', color: 'var(--gold)', marginBottom: 4, letterSpacing: '.06em' }}>
              ACCOUNT DELETED
            </div>
            계정이 탈퇴 처리됐어요.<br />
            <span style={{ fontSize: 11, color: 'var(--txt-muted)' }}>새 계정으로 다시 가입할 수 있어요</span>
          </div>
        )}

        <div className="login-hero">
          <div className="hero-logo">{appTitle}<span>BOOK</span></div>
          <div className="hero-tagline">Original Ticket Collection</div>

          <div className="ticket-deco">
            <div className="deco-card"><Music size={24} strokeWidth={1.6} /></div>
            <div className="deco-card"><Ticket size={24} strokeWidth={1.6} /></div>
            <div className="deco-card"><Globe size={24} strokeWidth={1.6} /></div>
          </div>

          <div className="login-form-wrap">
            <div className="form-card">
              <button className="btn-social btn-google" onClick={handleLogin} disabled={isLoading}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Google로 계속하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="login-loading show">
          <div className="loading-inner">
            <div className="loading-logo">{appTitle}<span>BOOK</span></div>
            <div className="loading-bar"><div className="loading-progress" /></div>
          </div>
        </div>
      )}
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
