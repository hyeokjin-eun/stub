# OTBOOK 에러 핸들링 가이드

> Next.js 프론트엔드 에러 처리 패턴과 전략

---

## 에러 처리 전략

### 1. 에러 계층 구조

```
Frontend Errors
├── Network Errors          # API 호출 실패
│   ├── ConnectionError     # 네트워크 연결 실패
│   ├── TimeoutError        # 요청 타임아웃
│   └── ApiError           # API 응답 에러 (4xx, 5xx)
├── Validation Errors       # 입력 검증 에러
│   ├── FormValidationError
│   └── DataValidationError
├── UI Errors              # UI 렌더링 에러
│   ├── ComponentError
│   └── StateError
└── Application Errors     # 애플리케이션 로직 에러
    ├── NotFoundError
    └── UnauthorizedError
```

---

## Next.js 에러 처리

### 1. Error Boundary (React)

```typescript
// components/common/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    // 에러 로깅 서비스에 전송 (예: Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#c9a84c] mb-4">
                문제가 발생했습니다
              </h1>
              <p className="text-[#7a7068] mb-8">
                {this.state.error?.message || '알 수 없는 오류가 발생했습니다'}
              </p>
              <button
                className="bg-[#c9a84c] text-[#0a0a0a] px-6 py-3 rounded-xl"
                onClick={() => window.location.reload()}
              >
                새로고침
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

**사용:**
```typescript
// app/layout.tsx
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

---

### 2. Next.js error.tsx (App Router)

```typescript
// app/error.tsx
'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-[#f0ece4]">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-[#c9a84c] mb-4">
          오류가 발생했습니다
        </h2>
        <p className="text-[#7a7068] mb-6">
          {error.message || '페이지를 로드할 수 없습니다'}
        </p>
        <button
          onClick={reset}
          className="bg-[#c9a84c] text-[#0a0a0a] px-6 py-3 rounded-xl hover:bg-[#f0d07a]"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
```

---

### 3. 404 Not Found

```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-[#f0ece4]">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-[#c9a84c] mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-[#7a7068] mb-8">
          요청하신 페이지가 존재하지 않습니다.
        </p>
        <a
          href="/"
          className="inline-block bg-[#c9a84c] text-[#0a0a0a] px-6 py-3 rounded-xl hover:bg-[#f0d07a]"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  )
}
```

---

## API 에러 처리

### 1. API 클라이언트 (향후 백엔드 연동 시)

```typescript
// lib/api/client.ts

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        response.status,
        error.message || response.statusText,
        error.code
      )
    }

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // 네트워크 에러
    throw new ApiError(0, '네트워크 연결에 실패했습니다')
  }
}
```

---

### 2. API 호출 예시

```typescript
// lib/api/tickets.ts
import { apiClient, ApiError } from './client'
import { Ticket } from '@/types/ticket'

export async function getTickets(): Promise<Ticket[]> {
  try {
    return await apiClient<Ticket[]>('/api/tickets')
  } catch (error) {
    if (error instanceof ApiError) {
      // 상태코드별 처리
      switch (error.status) {
        case 401:
          // 인증 필요
          throw new Error('로그인이 필요합니다')
        case 404:
          throw new Error('티켓을 찾을 수 없습니다')
        case 500:
          throw new Error('서버 오류가 발생했습니다')
        default:
          throw new Error('티켓을 불러올 수 없습니다')
      }
    }
    throw error
  }
}
```

---

### 3. 컴포넌트에서 API 에러 처리

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getTickets } from '@/lib/api/tickets'
import { Ticket } from '@/types/ticket'

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true)
        setError(null)
        const data = await getTickets()
        setTickets(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류')
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [])

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[#e03a3a] mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#c9a84c] text-[#0a0a0a] px-4 py-2 rounded-lg"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}
```

---

## 폼 검증 에러

### 1. 클라이언트 폼 검증

```typescript
'use client'

import { useState } from 'react'

interface FormErrors {
  title?: string
  date?: string
  venue?: string
}

export function TicketForm() {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    venue: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = '티켓 제목을 입력하세요'
    }

    if (!formData.date) {
      newErrors.date = '날짜를 선택하세요'
    }

    if (!formData.venue.trim()) {
      newErrors.venue = '장소를 입력하세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    console.log('Form submitted:', formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl bg-[#1c1c1c] text-[#f0ece4] border ${
            errors.title ? 'border-[#e03a3a]' : 'border-[#2a2a2a]'
          }`}
          placeholder="티켓 제목"
        />
        {errors.title && (
          <p className="text-[#e03a3a] text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl bg-[#1c1c1c] text-[#f0ece4] border ${
            errors.date ? 'border-[#e03a3a]' : 'border-[#2a2a2a]'
          }`}
        />
        {errors.date && (
          <p className="text-[#e03a3a] text-sm mt-1">{errors.date}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          value={formData.venue}
          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl bg-[#1c1c1c] text-[#f0ece4] border ${
            errors.venue ? 'border-[#e03a3a]' : 'border-[#2a2a2a]'
          }`}
          placeholder="장소"
        />
        {errors.venue && (
          <p className="text-[#e03a3a] text-sm mt-1">{errors.venue}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-[#c9a84c] text-[#0a0a0a] py-3 rounded-xl font-semibold hover:bg-[#f0d07a]"
      >
        저장
      </button>
    </form>
  )
}
```

---

## Toast 알림 (에러 메시지)

### 1. Toast 컴포넌트

```typescript
// components/ui/Toast.tsx
'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300) // 애니메이션 후 제거
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: 'bg-[#2dcc70]',
    error: 'bg-[#e03a3a]',
    info: 'bg-[#4488ff]',
  }

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl text-white ${
        colors[type]
      } transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {message}
    </div>
  )
}
```

---

### 2. Toast 사용 예시

```typescript
'use client'

import { useState } from 'react'
import { Toast, ToastType } from '@/components/ui/Toast'

export function MyComponent() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type })
  }

  const handleSave = async () => {
    try {
      // API 호출
      await saveData()
      showToast('저장되었습니다', 'success')
    } catch (error) {
      showToast('저장에 실패했습니다', 'error')
    }
  }

  return (
    <div>
      <button onClick={handleSave}>저장</button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
```

---

## 로딩 상태 처리

### 1. 로딩 스피너

```typescript
// components/ui/Spinner.tsx
export function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-8 h-8 border-4 border-[#2a2a2a] border-t-[#c9a84c] rounded-full animate-spin" />
    </div>
  )
}
```

---

### 2. 로딩 상태 컴포넌트

```typescript
// app/loading.tsx (App Router)
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#2a2a2a] border-t-[#c9a84c] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#7a7068]">로딩 중...</p>
      </div>
    </div>
  )
}
```

---

## 에러 로깅

### 1. 콘솔 로깅

```typescript
// lib/utils/logger.ts
export const logger = {
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error)
    // 프로덕션: 외부 로깅 서비스에 전송 (Sentry, LogRocket 등)
  },

  warn: (message: string) => {
    console.warn(`[WARN] ${message}`)
  },

  info: (message: string) => {
    console.info(`[INFO] ${message}`)
  },
}
```

---

### 2. 사용 예시

```typescript
import { logger } from '@/lib/utils/logger'

try {
  await fetchData()
} catch (error) {
  logger.error('데이터 로드 실패', error as Error)
  throw error
}
```

---

## 모범 사례

### 1. 사용자 친화적인 에러 메시지

```typescript
// ❌ 나쁜 예
throw new Error('ERR_NETWORK_001')

// ✅ 좋은 예
throw new Error('네트워크 연결을 확인해주세요')
```

---

### 2. 에러 복구 옵션 제공

```typescript
// ✅ 좋은 예
<div className="error-state">
  <p>티켓을 불러올 수 없습니다</p>
  <button onClick={retry}>다시 시도</button>
  <button onClick={goHome}>홈으로 돌아가기</button>
</div>
```

---

### 3. 적절한 에러 레벨

```typescript
try {
  await criticalOperation()
} catch (error) {
  // 치명적 에러 - 페이지 전체 에러
  throw error
}

try {
  await optionalOperation()
} catch (error) {
  // 비치명적 에러 - Toast 알림만
  showToast('일부 기능을 사용할 수 없습니다', 'warn')
}
```

---

## 다음 단계

- **[security-guide.md](./security-guide.md)** - 프론트엔드 보안
- **[testing-guide.md](./testing-guide.md)** - 에러 케이스 테스트
- **[frontend-guide.md](./frontend-guide.md)** - 컴포넌트 작성
