# OTBOOK Frontend 가이드

> Next.js + TypeScript + Tailwind CSS 개발 가이드

---

## 기술 스택

| 구분 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Framework | Next.js | 15+ | React 프레임워크 (App Router) |
| Language | TypeScript | 5+ | 타입 안정성 |
| Styling | Tailwind CSS | 3.4+ | 유틸리티 기반 스타일링 |
| Runtime | React | 19+ | UI 라이브러리 |
| Build | Next.js Build | - | Static Site Generation |

---

## 프로젝트 구조

```
client-web/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 홈 페이지
│   ├── globals.css             # 전역 스타일
│   │
│   ├── search/                 # 검색 페이지
│   │   └── page.tsx
│   │
│   ├── catalog/                # 카탈로그
│   │   ├── page.tsx            # 목록
│   │   └── [id]/               # 상세 (Dynamic Route)
│   │       └── page.tsx
│   │
│   └── my/                     # 마이 페이지
│       └── page.tsx
│
├── components/                 # React 컴포넌트
│   ├── common/                 # 공통 컴포넌트
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   └── Layout.tsx
│   │
│   ├── ui/                     # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Input.tsx
│   │
│   └── features/               # 기능별 컴포넌트
│       ├── ticket/             # 티켓 관련
│       │   ├── TicketCard.tsx
│       │   ├── TicketPager.tsx
│       │   └── TicketModal.tsx
│       │
│       ├── catalog/            # 카탈로그 관련
│       │   ├── GroupCard.tsx
│       │   └── CategoryFilter.tsx
│       │
│       └── search/             # 검색 관련
│           ├── SearchBar.tsx
│           └── RecentSearches.tsx
│
├── lib/                        # 유틸리티
│   ├── data/                   # Mock 데이터
│   │   ├── tickets.ts
│   │   ├── groups.ts
│   │   └── icons.ts
│   │
│   └── utils/                  # 헬퍼 함수
│       ├── cn.ts               # className 유틸
│       └── format.ts           # 포맷 함수
│
├── types/                      # TypeScript 타입
│   ├── ticket.ts
│   ├── group.ts
│   └── user.ts
│
├── public/                     # 정적 파일
│   ├── images/
│   └── fonts/
│
├── next.config.ts              # Next.js 설정
├── tailwind.config.ts          # Tailwind 설정
├── tsconfig.json               # TypeScript 설정
└── package.json
```

---

## 페이지 라우팅

### App Router 구조

```typescript
// app/page.tsx → /
export default function HomePage() {
  return <main>홈 페이지</main>
}

// app/search/page.tsx → /search
export default function SearchPage() {
  return <main>검색 페이지</main>
}

// app/catalog/page.tsx → /catalog
export default function CatalogPage() {
  return <main>카탈로그 목록</main>
}

// app/catalog/[id]/page.tsx → /catalog/:id (Dynamic Route)
export default function CatalogDetailPage({ params }: { params: { id: string } }) {
  return <main>카탈로그 상세: {params.id}</main>
}

// app/my/page.tsx → /my
export default function MyPage() {
  return <main>마이 페이지</main>
}
```

---

### URL 파라미터 & 쿼리

```typescript
// Dynamic Route - params
// URL: /catalog/seoul-jazz-2025
export default function CatalogDetailPage({ params }: { params: { id: string } }) {
  const { id } = params // 'seoul-jazz-2025'
  return <div>{id}</div>
}

// Search Params - searchParams
// URL: /search?q=콘서트&cat=MUSIC
export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string }
}) {
  const query = searchParams.q // '콘서트'
  const category = searchParams.cat // 'MUSIC'
  return <div>{query} in {category}</div>
}
```

---

## 컴포넌트 작성

### 1. 기본 컴포넌트 (UI)

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-xl transition-all'

  const variants = {
    primary: 'bg-[#c9a84c] text-[#0a0a0a] hover:bg-[#f0d07a]',
    secondary: 'bg-[#1c1c1c] text-[#f0ece4] border border-[#2a2a2a] hover:border-[#c9a84c]',
    ghost: 'bg-transparent text-[#f0ece4] hover:bg-[#1c1c1c]',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

---

### 2. 기능 컴포넌트

```typescript
// components/features/ticket/TicketCard.tsx
import { Ticket } from '@/types/ticket'

interface TicketCardProps {
  ticket: Ticket
  onClick?: () => void
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  return (
    <div
      className="relative bg-gradient-to-br from-[#1a0030] to-[#2d0060] rounded-2xl p-6 cursor-pointer"
      onClick={onClick}
    >
      {/* 등급 뱃지 */}
      {ticket.grade && (
        <div className="absolute top-4 right-4 bg-[#c9a84c] text-[#0a0a0a] px-3 py-1 rounded-lg text-sm font-bold">
          {ticket.grade}
        </div>
      )}

      {/* 티켓 정보 */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">{ticket.title}</h3>
        <p className="text-[#7a7068] text-sm">{ticket.date}</p>
        <p className="text-[#7a7068] text-sm">{ticket.venue}</p>
      </div>

      {/* 좋아요 */}
      <div className="mt-4 flex items-center text-[#7a7068]">
        <span>❤️ {ticket.likes}</span>
      </div>

      {/* 퍼포레이션 효과 */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]"
        style={{
          maskImage: 'radial-gradient(circle at 10px, transparent 8px, black 8px)',
          maskSize: '20px 100%',
        }}
      />
    </div>
  )
}
```

---

### 3. 레이아웃 컴포넌트

```typescript
// components/common/Layout.tsx
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ece4]">
      <Header />
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
```

---

## 타입 정의

### 1. Ticket 타입

```typescript
// types/ticket.ts
export type TicketGrade = 'S' | 'A' | 'B' | 'C'
export type TicketStatus = 'collected' | 'uncollected'
export type Category = 'MUSIC' | 'SPORTS' | 'THEATER' | 'EXHIBITION' | 'CINEMA' | 'FESTIVAL'

export interface Ticket {
  id: string
  title: string
  date: string
  venue: string
  category: Category
  color: string
  icon: string
  grade: TicketGrade
  status: TicketStatus
  seatInfo?: string
  price?: number
  likes: number
}
```

---

### 2. Group 타입

```typescript
// types/group.ts
import { Ticket, Category } from './ticket'

export interface CatalogGroup {
  id: string
  name: string
  category: Category
  color: string
  icon: string
  description: string
  tickets: Ticket[]
  totalTickets: number
  collectedTickets: number
  collectors: number
  likes: number
}
```

---

## Mock 데이터

```typescript
// lib/data/tickets.ts
import { Ticket } from '@/types/ticket'

export const MOCK_TICKETS: Ticket[] = [
  {
    id: '1',
    title: '서울재즈페스티벌 2025',
    date: '2025-05-15',
    venue: '올림픽공원',
    category: 'MUSIC',
    color: 'purple',
    icon: 'music',
    grade: 'S',
    status: 'collected',
    seatInfo: 'VIP Zone A-12',
    price: 150000,
    likes: 189,
  },
  {
    id: '2',
    title: 'BTS World Tour',
    date: '2025-06-20',
    venue: '잠실 주경기장',
    category: 'MUSIC',
    color: 'purple',
    icon: 'mic',
    grade: 'A',
    status: 'collected',
    likes: 542,
  },
  // ...
]

// 유틸리티 함수
export function getTicketById(id: string): Ticket | undefined {
  return MOCK_TICKETS.find(ticket => ticket.id === id)
}

export function getTicketsByCategory(category: Category): Ticket[] {
  return MOCK_TICKETS.filter(ticket => ticket.category === category)
}
```

---

## 스타일링 (Tailwind CSS)

### 1. 시네마 다크 테마 적용

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#f0ece4',
        gold: {
          DEFAULT: '#c9a84c',
          light: '#f0d07a',
        },
        surface: '#141414',
        card: '#1c1c1c',
        border: '#2a2a2a',
        muted: '#7a7068',
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        noto: ['Noto Sans KR', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

---

### 2. 커스텀 클래스 유틸리티

```typescript
// lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**사용 예시:**
```typescript
import { cn } from '@/lib/utils/cn'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
)} />
```

---

## 상태 관리

### 1. useState (로컬 상태)

```typescript
'use client'

import { useState } from 'react'

export function SearchBar() {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    console.log('Searching for:', query)
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색..."
      />
      <button onClick={handleSearch}>검색</button>
    </div>
  )
}
```

---

### 2. useEffect (사이드 이펙트)

```typescript
'use client'

import { useState, useEffect } from 'react'

export function TicketList() {
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    // 데이터 로드
    const loadTickets = async () => {
      const data = await fetch('/api/tickets')
      setTickets(await data.json())
    }

    loadTickets()
  }, []) // 빈 배열 = 마운트 시 1회 실행

  return <div>{/* 티켓 렌더링 */}</div>
}
```

---

### 3. 전역 상태 (Context API - 향후)

```typescript
// lib/context/AppContext.tsx
'use client'

import { createContext, useContext, useState } from 'react'

interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
```

---

## 이미지 처리

### Static Export에서 이미지 사용

```typescript
// next.config.ts에서 unoptimized: true 설정 필요

// 방법 1: public 폴더 (권장)
<img src="/images/ticket.png" alt="Ticket" />

// 방법 2: next/image (Static Export에서는 unoptimized)
import Image from 'next/image'

<Image
  src="/images/ticket.png"
  alt="Ticket"
  width={300}
  height={200}
/>
```

---

## 폼 처리

```typescript
'use client'

import { useState } from 'react'

export function TicketForm() {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    venue: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="티켓 제목"
      />
      <input
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
      />
      <input
        name="venue"
        value={formData.venue}
        onChange={handleChange}
        placeholder="장소"
      />
      <button type="submit">저장</button>
    </form>
  )
}
```

---

## 애니메이션

### Tailwind 애니메이션

```typescript
// 페이드인
<div className="animate-fade-in">Content</div>

// 슬라이드업
<div className="animate-slide-up">Content</div>

// 커스텀 애니메이션 (tailwind.config.ts)
animation: {
  'fade-in': 'fadeIn 0.3s ease-in',
  'slide-up': 'slideUp 0.4s ease-out',
}
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideUp: {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
}
```

---

## 모범 사례

### 1. 파일명 규칙

- **컴포넌트**: PascalCase (예: `TicketCard.tsx`)
- **유틸리티**: camelCase (예: `formatDate.ts`)
- **페이지**: kebab-case 또는 camelCase (예: `page.tsx`)
- **타입 파일**: camelCase (예: `ticket.ts`)

---

### 2. 컴포넌트 구조

```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

// 2. Types
interface MyComponentProps {
  title: string
}

// 3. Component
export function MyComponent({ title }: MyComponentProps) {
  // 4. State & Hooks
  const [isOpen, setIsOpen] = useState(false)

  // 5. Handlers
  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Toggle</Button>
    </div>
  )
}
```

---

### 3. 'use client' 사용

```typescript
// 클라이언트 컴포넌트 (상태, 이벤트 사용)
'use client'

import { useState } from 'react'

export function InteractiveButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// 서버 컴포넌트 (Static Export에서는 모두 정적 HTML로 빌드)
export function StaticContent() {
  return <div>Static content</div>
}
```

---

## 다음 단계

- **[testing-guide.md](./testing-guide.md)** - 컴포넌트 테스트 작성
- **[deployment-guide.md](./deployment-guide.md)** - 빌드 및 배포
- **[CLAUDE.md](../.claude/CLAUDE.md)** - 전체 개발 가이드
