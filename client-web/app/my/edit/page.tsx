'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChevronLeft, Camera, User, Check, Phone, ShieldCheck, RefreshCw } from 'lucide-react'
import Navigation from '@/components/Navigation'

// 전화번호 포맷: 010-1234-5678
const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

const isValidPhone = (phone: string) => /^010-\d{4}-\d{4}$/.test(phone)

type PhoneStep = 'idle' | 'sent' | 'verified'

export default function EditProfilePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const fileRef = useRef<HTMLInputElement>(null)

  // ── 기본 정보
  const [nickname, setNickname] = useState('')
  const [bio, setBio]           = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // ── 전화번호 인증
  const [phone, setPhone]           = useState('')
  const [phoneStep, setPhoneStep]   = useState<PhoneStep>('idle')
  const [code, setCode]             = useState('')
  const [codeError, setCodeError]   = useState('')
  const [timer, setTimer]           = useState(0)          // 남은 초
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setNickname(session.user.name || '')
      setBio('영화를 사랑하는 티켓 컬렉터')
    }
  }, [session])

  // 타이머 정리
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  // ── 아바타
  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  // ── 인증번호 발송
  const handleSendCode = async () => {
    if (!isValidPhone(phone)) return
    setSendingCode(true)
    try {
      // TODO: await authApi.sendPhoneCode(phone)
      await new Promise(r => setTimeout(r, 700))
      setPhoneStep('sent')
      setCode('')
      setCodeError('')
      // 3분 타이머
      setTimer(180)
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
          return prev - 1
        })
      }, 1000)
    } finally {
      setSendingCode(false)
    }
  }

  // ── 인증번호 확인
  const handleVerifyCode = async () => {
    if (code.length !== 6) return
    setVerifyingCode(true)
    setCodeError('')
    try {
      // TODO: await authApi.verifyPhoneCode(phone, code)
      await new Promise(r => setTimeout(r, 600))
      // mock: '123456' 만 성공
      if (code === '123456') {
        setPhoneStep('verified')
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        setCodeError('인증번호가 올바르지 않아요')
      }
    } finally {
      setVerifyingCode(false)
    }
  }

  // ── 재발송
  const handleResend = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhoneStep('idle')
    setCode('')
    setCodeError('')
    setTimer(0)
  }

  // ── 저장
  const handleSave = async () => {
    if (!nickname.trim()) return
    setSaving(true)
    try {
      // TODO: usersApi.update(userId, { nickname, bio, phone, avatar })
      await new Promise(r => setTimeout(r, 600))
      router.back()
    } finally {
      setSaving(false)
    }
  }

  const mm = String(Math.floor(timer / 60)).padStart(2, '0')
  const ss = String(timer % 60).padStart(2, '0')

  const inputStyle = (active?: boolean): React.CSSProperties => ({
    width: '100%', padding: '14px 16px',
    background: 'var(--card)',
    border: `1.5px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
    borderRadius: 12, color: 'var(--txt)', fontSize: 15,
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', transition: 'border-color .2s',
  })

  return (
    <div className="app-container">
      <main className="main-content" style={{ paddingBottom: 'calc(var(--nav-h) + 72px)' }}>

        {/* TopBar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontFamily: 'DM Mono', color: 'var(--txt)', cursor: 'pointer', padding: '6px 8px', borderRadius: 8 }}
            onClick={() => router.back()}
          >
            <ChevronLeft size={20} /> 마이페이지
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)' }}>프로필 편집</div>
          <div style={{ width: 80 }} />
        </div>

        <div style={{ padding: '32px 20px 0' }}>

          {/* ── 아바타 ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'var(--card)', border: '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <User size={42} color="rgba(201,168,76,.6)" />
                }
              </div>
              <div style={{
                position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%',
                background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg)',
              }}>
                <Camera size={14} color="#0a0800" />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--txt-muted)' }}>탭해서 사진 변경</div>
          </div>

          {/* ── 닉네임 ── */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-label">닉네임 *</div>
            <input
              style={inputStyle(!!nickname.trim())}
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={30}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, fontSize: 11, fontFamily: 'DM Mono', color: 'var(--txt-muted)' }}>
              {nickname.length} / 30
            </div>
          </div>

          {/* ── 이메일 (읽기 전용) ── */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-label">이메일</div>
            <div style={{
              padding: '14px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,.03)', border: '1.5px solid var(--border)',
              fontSize: 14, color: 'var(--txt-muted)',
            }}>
              {session?.user?.email || '—'}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--txt-muted)' }}>이메일은 변경할 수 없어요</div>
          </div>

          {/* ── 전화번호 ── */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-label">전화번호</div>

            {/* 입력 + 인증 요청 버튼 */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Phone size={15} color="var(--txt-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  style={{ ...inputStyle(phoneStep === 'verified'), paddingLeft: 40, opacity: phoneStep === 'verified' ? 0.6 : 1 }}
                  value={phone}
                  onChange={e => {
                    if (phoneStep !== 'verified') {
                      setPhone(formatPhone(e.target.value))
                      setPhoneStep('idle')
                    }
                  }}
                  placeholder="010-0000-0000"
                  inputMode="numeric"
                  readOnly={phoneStep === 'verified'}
                />
                {phoneStep === 'verified' && (
                  <ShieldCheck size={16} color="var(--gold)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
                )}
              </div>

              {phoneStep !== 'verified' && (
                <button
                  onClick={phoneStep === 'sent' ? handleResend : handleSendCode}
                  disabled={(!isValidPhone(phone) && phoneStep === 'idle') || sendingCode}
                  style={{
                    flexShrink: 0, padding: '0 16px', height: 50,
                    borderRadius: 12, border: '1.5px solid var(--border)',
                    background: 'var(--card)', color: isValidPhone(phone) ? 'var(--gold)' : 'var(--txt-muted)',
                    fontSize: 13, fontWeight: 600, cursor: isValidPhone(phone) ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                    transition: 'border-color .2s, color .2s',
                  }}
                >
                  {sendingCode
                    ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    : phoneStep === 'sent' ? '재발송' : '인증 요청'
                  }
                </button>
              )}
            </div>

            {/* 인증번호 입력 */}
            {phoneStep === 'sent' && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      style={{ ...inputStyle(code.length === 6), letterSpacing: '0.2em', textAlign: 'center', fontSize: 20, fontFamily: 'DM Mono', paddingRight: 60 }}
                      value={code}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setCode(v)
                        setCodeError('')
                      }}
                      placeholder="• • • • • •"
                      inputMode="numeric"
                      autoFocus
                    />
                    {/* 타이머 */}
                    {timer > 0 && (
                      <div style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 12, fontFamily: 'DM Mono',
                        color: timer < 30 ? 'var(--red)' : 'var(--txt-muted)',
                      }}>
                        {mm}:{ss}
                      </div>
                    )}
                    {timer === 0 && (
                      <div style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 11, fontFamily: 'DM Mono', color: 'var(--red)',
                      }}>
                        만료
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleVerifyCode}
                    disabled={code.length !== 6 || verifyingCode || timer === 0}
                    style={{
                      flexShrink: 0, padding: '0 16px', height: 50,
                      borderRadius: 12, border: 'none',
                      background: code.length === 6 && timer > 0 ? 'var(--gold)' : 'var(--card)',
                      color: code.length === 6 && timer > 0 ? '#0a0800' : 'var(--txt-muted)',
                      fontSize: 13, fontWeight: 700, cursor: code.length === 6 && timer > 0 ? 'pointer' : 'default',
                      whiteSpace: 'nowrap', transition: 'background .2s, color .2s',
                    }}
                  >
                    {verifyingCode ? '확인 중...' : '확인'}
                  </button>
                </div>

                {codeError && (
                  <div style={{ marginTop: 6, fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>⚠</span> {codeError}
                  </div>
                )}

                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--txt-muted)' }}>
                  {phone}으로 발송된 6자리 인증번호를 입력하세요
                </div>
              </div>
            )}

            {phoneStep === 'verified' && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={13} /> 전화번호 인증 완료
                <span
                  style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--txt-muted)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={handleResend}
                >
                  변경
                </span>
              </div>
            )}
          </div>

          {/* ── 자기소개 ── */}
          <div style={{ marginBottom: 32 }}>
            <div className="section-label">자기소개</div>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="간단한 자기소개를 입력하세요"
              maxLength={100}
              rows={3}
              style={{
                width: '100%', padding: '14px 16px',
                background: 'var(--card)', border: '1.5px solid var(--border)',
                borderRadius: 12, color: 'var(--txt)', fontSize: 14,
                outline: 'none', resize: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box', lineHeight: 1.6, transition: 'border-color .2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,.5)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, fontSize: 11, fontFamily: 'DM Mono', color: 'var(--txt-muted)' }}>
              {bio.length} / 100
            </div>
          </div>

        </div>
      </main>

      {/* ── 저장 바 ── */}
      <div className="nc-save-bar">
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!nickname.trim() || saving}
          style={{ width: '100%', height: 48, fontSize: 15, justifyContent: 'center' }}
        >
          {saving ? '저장 중...' : <><Check size={18} /> 저장하기</>}
        </button>
      </div>

      {/* spin 키프레임 인라인 */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Navigation />
    </div>
  )
}
