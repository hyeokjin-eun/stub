# OTBOOK - 시작 가이드

> Next.js 기반 오리지널 티켓 컬렉션 앱 개발 가이드

---

## 빠른 시작

### 1. 사전 요구사항

```bash
# Node.js 버전 확인 (18+ 필요)
node --version  # v18.0.0 이상

# npm 버전 확인
npm --version   # 9.0.0 이상
```

**필수 설치:**
- Node.js 18+ (https://nodejs.org/)
- npm or yarn or pnpm
- 코드 에디터 (VS Code 권장)

---

### 2. 프로젝트 클론 및 설정

```bash
# 프로젝트 디렉토리로 이동
cd /Users/musinsa/Desktop/project/invi/stub

# Client-Web 의존성 설치
cd client-web
npm install

# Admin 의존성 설치
cd ../admin
npm install
```

---

### 3. 개발 서버 실행

#### Client-Web (고객용 앱)

```bash
cd client-web
npm run dev
```

- 🌐 **URL**: http://localhost:3000
- 🔥 **Hot Reload**: 파일 저장 시 자동 반영
- 📱 **모바일 테스트**: http://[내부IP]:3000

#### Admin (관리자 대시보드)

```bash
cd admin
npm run dev
```

- 🌐 **URL**: http://localhost:3001
- 🔒 **접근**: 관리자 전용 페이지

#### 동시 실행 (터미널 2개 사용)

```bash
# 터미널 1
cd client-web && npm run dev

# 터미널 2
cd admin && npm run dev
```

---

### 4. 프로젝트 구조 이해

```
stub/
├── client-web/          # 고객용 프론트엔드
│   ├── app/             # Next.js App Router
│   │   ├── page.tsx     # 홈 페이지
│   │   ├── layout.tsx   # 루트 레이아웃
│   │   └── globals.css  # 전역 스타일 (시네마 테마)
│   ├── components/      # React 컴포넌트
│   ├── lib/             # 유틸리티, 데이터
│   ├── public/          # 정적 파일 (이미지, SVG)
│   └── package.json
│
├── admin/               # 어드민 프론트엔드
│   └── (동일한 구조)
│
└── .claude/             # 프로젝트 문서
    ├── PROJECT.md       # 프로젝트 개요
    ├── CLAUDE.md        # 개발 가이드
    └── guides/          # 가이드 문서들
```

---

## 주요 개념

### 1. Next.js App Router

**파일 기반 라우팅:**
```
app/
├── page.tsx              → /
├── search/
│   └── page.tsx          → /search
├── catalog/
│   ├── page.tsx          → /catalog
│   └── [id]/
│       └── page.tsx      → /catalog/:id (Dynamic Route)
└── my/
    └── page.tsx          → /my
```

**페이지 컴포넌트 작성:**
```typescript
// app/search/page.tsx
export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece4]">
      <h1>검색</h1>
    </main>
  )
}
```

---

### 2. Static Export

**설정 파일 (next.config.ts):**
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',  // ← 정적 파일 빌드
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

**빌드 결과:**
```bash
npm run build
# → out/ 폴더에 HTML/CSS/JS 생성
# → nginx에 바로 배포 가능
```

---

### 3. 디자인 시스템 (시네마 다크 테마)

**CSS 변수 (globals.css):**
```css
:root {
  --background: #0a0a0a;  /* 딥 다크 */
  --foreground: #f0ece4;  /* 아이보리 */
  --gold: #c9a84c;        /* 골드 액센트 */
  --card: #1c1c1c;        /* 카드 배경 */
}
```

**Tailwind 클래스 사용:**
```tsx
<div className="bg-[#0a0a0a] text-[#f0ece4]">
  <h1 className="text-[#c9a84c]">OTBOOK</h1>
</div>
```

---

## 첫 페이지 만들기

### 1. 새 페이지 생성

```bash
mkdir -p client-web/app/search
```

### 2. page.tsx 작성

```typescript
// client-web/app/search/page.tsx
export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece4] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-[#c9a84c]">검색</h1>

        <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-[#2a2a2a]">
          <input
            type="text"
            placeholder="티켓을 검색하세요..."
            className="w-full bg-[#0a0a0a] text-[#f0ece4] px-4 py-3 rounded-xl border border-[#2a2a2a] focus:border-[#c9a84c] outline-none"
          />
        </div>
      </div>
    </main>
  )
}
```

### 3. 브라우저에서 확인

- http://localhost:3000/search

---

## 컴포넌트 작성하기

### 1. 컴포넌트 디렉토리 생성

```bash
mkdir -p client-web/components/ui
```

### 2. Button 컴포넌트

```typescript
// client-web/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-xl font-semibold transition-all'
  const variants = {
    primary: 'bg-[#c9a84c] text-[#0a0a0a] hover:bg-[#f0d07a]',
    secondary: 'bg-[#1c1c1c] text-[#f0ece4] border border-[#2a2a2a] hover:border-[#c9a84c]'
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### 3. 페이지에서 사용

```typescript
import { Button } from '@/components/ui/Button'

export default function SearchPage() {
  return (
    <main>
      <Button variant="primary" onClick={() => alert('검색!')}>
        검색
      </Button>
    </main>
  )
}
```

---

## 타입 정의하기

### 1. 타입 디렉토리 생성

```bash
mkdir -p client-web/types
```

### 2. Ticket 타입 정의

```typescript
// client-web/types/ticket.ts
export type TicketGrade = 'S' | 'A' | 'B' | 'C'
export type TicketStatus = 'collected' | 'uncollected'

export interface Ticket {
  id: string
  title: string
  date: string
  venue: string
  category: string
  color: string
  icon: string
  grade: TicketGrade
  status: TicketStatus
  likes: number
}
```

### 3. Mock 데이터 작성

```typescript
// client-web/lib/data/tickets.ts
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
    likes: 189
  },
  // ...
]
```

---

## 개발 팁

### VS Code 확장

권장 확장 프로그램:
- **ES7+ React/Redux/React-Native snippets**: 빠른 컴포넌트 생성
- **Tailwind CSS IntelliSense**: Tailwind 자동완성
- **TypeScript Vue Plugin**: TypeScript 지원
- **Prettier - Code formatter**: 코드 포맷팅

### Tailwind 자동완성

`.vscode/settings.json`:
```json
{
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### 타입 체크

```bash
# TypeScript 타입 체크
npm run build  # 빌드 시 자동 체크

# 또는
npx tsc --noEmit
```

---

## 다음 단계

1. **[Frontend Guide](./frontend-guide.md)** - Next.js 컴포넌트 작성 심화
2. **[PROJECT.md](../.claude/PROJECT.md)** - 프로젝트 구조 상세
3. **[CLAUDE.md](../.claude/CLAUDE.md)** - 전체 개발 가이드
4. **[Deployment Guide](./deployment-guide.md)** - 배포 방법

---

## 문제 해결

### 포트가 이미 사용 중

```bash
# 포트 3000을 사용 중인 프로세스 찾기
lsof -ti:3000

# 프로세스 종료
kill -9 $(lsof -ti:3000)

# 또는 다른 포트 사용
npm run dev -- -p 3002
```

### node_modules 재설치

```bash
rm -rf node_modules package-lock.json
npm install
```

### 빌드 에러

```bash
# .next 캐시 삭제
rm -rf .next

# 재빌드
npm run build
```

---

**개발 중 문제가 발생하면 [troubleshooting-guide.md](./troubleshooting-guide.md)를 참고하세요.**
