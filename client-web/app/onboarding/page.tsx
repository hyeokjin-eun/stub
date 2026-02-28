'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { User, Phone, Calendar, Sparkles } from 'lucide-react'
import { usersApi } from '@/lib/api'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    nickname: '',
    phone: '',
    birthDate: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 로그인 체크 및 백엔드 토큰 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    // 세션은 있지만 백엔드 토큰이 없으면 재로그인 필요
    if (status === 'authenticated' && session && !(session as any)?.backendToken) {
      console.warn('[Onboarding] No backend token found, signing out...')
      // 자동으로 로그아웃 후 로그인 페이지로 이동
      signOut({ callbackUrl: '/login' })
    }
  }, [status, session, router])

  // 세션에서 기본값 설정
  useEffect(() => {
    if (session?.user?.name) {
      setFormData((prev) => ({
        ...prev,
        nickname: session.user.name || '',
      }))
    }
  }, [session])

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요'
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다'
    } else if (formData.nickname.length > 20) {
      newErrors.nickname = '닉네임은 20자 이하여야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    // 전화번호는 선택사항
    if (formData.phone && !/^\d{10,11}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 전화번호를 입력해주세요 (10-11자리 숫자)'
    }

    // 생년월일은 선택사항
    if (formData.birthDate) {
      const birthYear = new Date(formData.birthDate).getFullYear()
      const currentYear = new Date().getFullYear()
      if (birthYear < 1900 || birthYear > currentYear) {
        newErrors.birthDate = '올바른 생년월일을 입력해주세요'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return

    setIsSubmitting(true)
    try {
      const userId = (session as any)?.user?.id

      if (userId) {
        // 1. 백엔드 onboarding_completed = true 저장
        await usersApi.update(Number(userId), {
          nickname: formData.nickname,
          phone: formData.phone || undefined,
          birth_date: formData.birthDate || undefined,
          onboarding_completed: true,
        })

        // 2. NextAuth JWT 토큰 강제 갱신 → 미들웨어가 onboarding_completed: true 를 읽게 됨
        await update({ onboarding_completed: true })

        // 3. 갱신된 세션으로 홈 이동
        router.push('/')
        router.refresh()
      } else {
        localStorage.setItem('onboarding_completed', 'true')
        localStorage.setItem('user_nickname', formData.nickname)
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      alert('정보 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="onboarding-container">
        <div style={{ textAlign: 'center', color: 'var(--txt-muted)' }}>로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-logo">
            OT<span>BOOK</span>
          </div>
          <div className="onboarding-step">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
          </div>
        </div>

        {/* Step 1: 닉네임 */}
        {step === 1 && (
          <div className="onboarding-step-content">
            <div className="onboarding-icon">
              <User size={48} color="var(--gold)" />
            </div>
            <h1 className="onboarding-title">환영합니다!</h1>
            <p className="onboarding-desc">
              OTBOOK에서 사용할 닉네임을 입력해주세요
            </p>

            <div className="onboarding-form">
              <div className="form-group">
                <label className="form-label">닉네임</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData({ ...formData, nickname: e.target.value })
                  }
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                  autoFocus
                />
                {errors.nickname && (
                  <div className="form-error">{errors.nickname}</div>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={handleNext}
              disabled={!formData.nickname.trim()}
            >
              다음
            </button>
          </div>
        )}

        {/* Step 2: 추가 정보 */}
        {step === 2 && (
          <div className="onboarding-step-content">
            <div className="onboarding-icon">
              <Sparkles size={48} color="var(--gold)" />
            </div>
            <h1 className="onboarding-title">거의 다 끝났어요!</h1>
            <p className="onboarding-desc">
              추가 정보를 입력해주세요 (선택사항)
            </p>

            <div className="onboarding-form">
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} style={{ marginRight: '6px' }} />
                  전화번호
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="010-1234-5678"
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} style={{ marginRight: '6px' }} />
                  생년월일
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.birthDate && (
                  <div className="form-error">{errors.birthDate}</div>
                )}
              </div>
            </div>

            <div className="onboarding-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                이전
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? '저장 중...' : '시작하기'}
              </button>
            </div>

            <div className="onboarding-skip" onClick={handleSubmit}>
              나중에 입력하기
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
