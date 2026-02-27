# OTBOOK — 개발 가이드

> **Version 2.0** | Next.js 기반 프로젝트

---

## 빠른 시작

### 개발 환경 실행

```bash
# Client-Web (고객용) 개발 서버
cd client-web
npm install
npm run dev
# → http://localhost:3000

# Admin (어드민) 개발 서버
cd admin
npm install
npm run dev
# → http://localhost:3001
```

### 빌드 및 배포

```bash
# 정적 파일 빌드
cd client-web && npm run build  # → out/ 폴더 생성
cd admin && npm run build       # → out/ 폴더 생성

# nginx에 배포
cp -r client-web/out/* /home/gurwls2399/client/
cp -r admin/out/* /home/gurwls2399/admin/

# nginx 재시작
systemctl reload nginx
```

---

## 프로젝트 컨셉

### 디자인 철학: 시네마 다크 테마

**영화관의 마법** — 어두운 극장에서 빛나는 티켓처럼, 딥 다크 배경에 골드 포인트 컬러로 티켓을 돋보이게 합니다.

**핵심 원칙:**
- **Deep Dark Background** (`#0a0a0a`) — 극장 관객석
- **Gold Accent** (`#c9a84c`) — 마키 전구의 빛
- **Warm Ivory Text** (`#f0ece4`) — 따뜻한 가독성
- **Gradient Cards** — 어두운 공간 속 컬러풀한 포스터
- **Perforation Effect** — radial-gradient로 티켓 천공 효과

---

## 디렉토리 구조

```
stub/
├── .claude/                    # 프로젝트 문서
│   ├── PROJECT.md              # 프로젝트 정보
│   ├── CLAUDE.md               # 이 파일
│   ├── guides/                 # 개발 가이드
│   │   ├── getting-started-guide.md
│   │   ├── frontend-guide.md
│   │   ├── deployment-guide.md
│   │   ├── error-handling-guide.md
│   │   ├── security-guide.md
│   │   └── testing-guide.md
│   └── specs/                  # 기능 스펙 (향후 추가)
│
├── client-web/                 # 고객용 프론트엔드 (Next.js)
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈 페이지
│   │   ├── globals.css         # 전역 스타일 (시네마 테마)
│   │   ├── (pages)/            # 페이지 라우트 (향후 추가)
│   │   │   ├── search/
│   │   │   ├── catalog/
│   │   │   ├── catalog/[id]/
│   │   │   └── my/
│   ├── components/             # React 컴포넌트
│   │   ├── common/             # 공통 (Header, BottomNav)
│   │   ├── ui/                 # UI 기본 (Button, Card, Modal)
│   │   └── features/           # 기능별 컴포넌트
│   │       ├── ticket/         # 티켓 카드, 페이저
│   │       ├── catalog/        # 카탈로그 그룹 카드
│   │       └── search/         # 검색 관련
│   ├── lib/                    # 유틸리티
│   │   ├── data/               # Mock 데이터 (catalog-data.ts)
│   │   └── utils/              # 헬퍼 함수
│   ├── public/                 # 정적 파일 (이미지, SVG)
│   ├── next.config.ts          # Static Export 설정
│   ├── tailwind.config.ts      # Tailwind 설정
│   ├── tsconfig.json
│   └── package.json
│
├── admin/                      # 어드민 프론트엔드 (Next.js)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # 대시보드
│   │   ├── globals.css
│   │   └── (pages)/            # 관리 페이지 (향후 추가)
│   │       ├── tickets/
│   │       ├── groups/
│   │       └── users/
│   ├── components/
│   ├── public/
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                     # 백엔드 (향후 개발)
│   └── (NestJS 프로젝트)
│
└── README.md
```

---

## 기술 스택

| 영역 | 기술 | 버전 | 목적 |
|------|------|------|------|
| **Framework** | Next.js | 15+ | App Router, Static Export |
| **Language** | TypeScript | 5+ | 타입 안정성 |
| **Styling** | Tailwind CSS | 3.4+ | 유틸리티 기반 스타일링 |
| **Runtime** | React | 19+ | UI 라이브러리 |
| **Build** | Next.js Build | - | Static Site Generation |
| **Backend** | NestJS (계획) | - | RESTful API |
| **Database** | SQLite (계획) | - | 프로토타입 DB |

---

## 디자인 시스템

### CSS 변수 (globals.css)

```css
:root {
  --background: #0a0a0a;      /* 딥 다크 배경 */
  --foreground: #f0ece4;      /* 아이보리 텍스트 */
  --surface: #141414;         /* 헤더/섹션 */
  --card: #1c1c1c;            /* 카드 배경 */
  --border: #2a2a2a;          /* 구분선 */
  --gold: #c9a84c;            /* 골드 액센트 */
  --gold-lt: #f0d07a;         /* 밝은 골드 */
  --red: #e03a3a;             /* 경고/HOT */
  --txt: #f0ece4;             /* 주 텍스트 */
  --txt-muted: #7a7068;       /* 보조 텍스트 */
}
```

### 타이포그래피

```css
/* Bebas Neue - 타이틀, 헤더 */
h1, h2, h3 {
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.05em;
}

/* Noto Sans KR - 본문 */
body {
  font-family: 'Noto Sans KR', sans-serif;
}

/* DM Mono - 메타 정보 */
.mono {
  font-family: 'DM Mono', monospace;
}
```

### 카드 컬러 클래스 (Tailwind 확장 예정)

| 클래스 | 배경 그라디언트 | 글로우 색 |
|--------|----------------|----------|
| `.c-purple` | `#1a0030 → #2d0060` | `#7b2ff7` |
| `.c-red` | `#200000 → #4a0000` | `#e03a3a` |
| `.c-teal` | `#001a1a → #003a3a` | `#00c8b0` |
| `.c-navy` | `#000820 → #001050` | `#4488ff` |
| `.c-amber` | `#1a1000 → #3d2600` | `#c9a84c` |
| `.c-green` | `#001a00 → #003a10` | `#2dcc70` |
| `.c-rose` | `#280012 → #500030` | `#e060a0` |
| `.c-sky` | `#000e22 → #002040` | `#40b4e0` |

---

## 컴포넌트 설계 (계획)

### 공통 컴포넌트 (`components/common/`)

```typescript
// Header.tsx
export function Header() {
  return (
    <header className="fixed top-0 w-full bg-surface/80 backdrop-blur-sm">
      {/* 로고, 알림, 검색 */}
    </header>
  )
}

// BottomNav.tsx
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full h-16 bg-surface/80 backdrop-blur-sm">
      {/* 홈, 검색, 카탈로그, 마이 */}
    </nav>
  )
}
```

### UI 컴포넌트 (`components/ui/`)

```typescript
// Card.tsx
interface CardProps {
  color: 'purple' | 'red' | 'teal' | 'navy' | 'amber' | 'green' | 'rose' | 'sky'
  children: React.ReactNode
}

// Modal.tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

// Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost'
  children: React.ReactNode
  onClick?: () => void
}
```

### 기능 컴포넌트 (`components/features/`)

```typescript
// ticket/TicketCard.tsx
interface TicketCardProps {
  id: string
  title: string
  date: string
  venue: string
  color: string
  icon: string
  grade?: string
  isCollected?: boolean
  isLocked?: boolean
}

// ticket/TicketPager.tsx
// 2×2 슬라이드 페이저
interface TicketPagerProps {
  tickets: Ticket[]
  filter: 'all' | 'collected' | 'uncollected'
}

// catalog/GroupCard.tsx
interface GroupCardProps {
  id: string
  name: string
  category: string
  color: string
  icon: string
  ticketCount: number
}
```

---

## 페이지 라우팅 (계획)

| 레거시 (otbook) | Next.js 라우트 | 설명 |
|----------------|---------------|------|
| `index.html` | `app/page.tsx` | 홈 페이지 |
| `search.html` | `app/search/page.tsx` | 검색 |
| `catalog.html` | `app/catalog/page.tsx` | 카탈로그 목록 |
| `catalog-detail.html` | `app/catalog/[id]/page.tsx` | 카탈로그 상세 (Dynamic Route) |
| `my.html` | `app/my/page.tsx` | 마이 페이지 |
| `login.html` | `app/login/page.tsx` | 로그인 (향후) |

**URL 예시:**
- `/` → 홈
- `/search?q=콘서트` → 검색 (쿼리 파라미터)
- `/catalog?cat=MUSIC` → 카탈로그 (카테고리 필터)
- `/catalog/seoul-jazz-2025` → 카탈로그 상세 (ID)
- `/my` → 마이 페이지

---

## 데이터 구조 (TypeScript)

### 타입 정의 예시 (`types/`)

```typescript
// types/ticket.ts
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
  seatInfo?: string
  price?: number
  likes: number
}

// types/group.ts
export type Category = 'MUSIC' | 'SPORTS' | 'THEATER' | 'EXHIBITION' | 'CINEMA' | 'FESTIVAL'

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

// types/user.ts
export interface User {
  id: string
  nickname: string
  bio: string
  avatar: string
  followers: number
  following: number
  ticketCount: number
}
```

---

## 레거시 마이그레이션 체크리스트

### otbook → Next.js 포팅 작업

#### 공통 작업
- [ ] CSS 변수 → Tailwind CSS 클래스로 변환
- [ ] SVG 아이콘 → React 컴포넌트화
- [ ] Mock 데이터 → TypeScript 타입 정의
- [ ] 애니메이션 → Tailwind 유틸리티 또는 Framer Motion

#### 페이지별 작업

**홈 (index.html → app/page.tsx)**
- [ ] 배너 슬라이더 컴포넌트
- [ ] Quick Stats 섹션
- [ ] 카테고리 필터 칩
- [ ] 추천 컬렉션 가로 스크롤
- [ ] 지금 인기 TOP5 리스트
- [ ] 주목할 컬렉터 가로 스크롤
- [ ] 최근 등록 2열 그리드

**검색 (search.html → app/search/page.tsx)**
- [ ] 검색바 (실시간 입력)
- [ ] 카테고리 필터 칩
- [ ] 최근 검색어 (로컬 스토리지)
- [ ] 인기 검색어 TOP10
- [ ] 카테고리별 탐색 카드
- [ ] 검색 결과 그리드

**카탈로그 (catalog.html → app/catalog/page.tsx)**
- [ ] Stats Strip
- [ ] 카테고리 필터 탭
- [ ] 그룹 카드 그리드 (2열)
- [ ] 카테고리별 섹션 헤더
- [ ] URL 쿼리 파라미터로 필터 연동

**카탈로그 상세 (catalog-detail.html → app/catalog/[id]/page.tsx)**
- [ ] Hero 영역 (SVG + 그라디언트)
- [ ] Meta Strip
- [ ] 티켓 탭 (전체/수집완료/미수집)
- [ ] 2×2 티켓 페이저 (슬라이드 애니메이션)
- [ ] 티켓 상세 모달
- [ ] 터치 스와이프 지원

**마이 페이지 (my.html → app/my/page.tsx)**
- [ ] 프로필 헤더
- [ ] 컬렉션 탭 전환
- [ ] 내 티켓 그리드
- [ ] 좋아요한 티켓
- [ ] 업적 시스템 (SVG 아이콘)
- [ ] 설정 메뉴

#### Admin 페이지
- [ ] 대시보드 (통계 카드)
- [ ] 티켓 관리 (CRUD)
- [ ] 그룹 관리 (생성/수정/삭제)
- [ ] 사용자 관리 (목록/상세)

---

## 개발 가이드

### 새로운 페이지 추가

```bash
# 1. 페이지 디렉토리 생성
mkdir -p client-web/app/new-page

# 2. page.tsx 생성
cat > client-web/app/new-page/page.tsx << 'EOF'
export default function NewPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f0ece4]">
      <h1>New Page</h1>
    </main>
  )
}
EOF

# 3. 개발 서버에서 확인
# http://localhost:3000/new-page
```

### 새로운 컴포넌트 추가

```typescript
// client-web/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-xl font-semibold transition-all'
  const variantClasses = {
    primary: 'bg-[#c9a84c] text-[#0a0a0a] hover:bg-[#f0d07a]',
    secondary: 'bg-[#1c1c1c] text-[#f0ece4] border border-[#2a2a2a] hover:border-[#c9a84c]'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### Mock 데이터 관리

```typescript
// lib/data/catalog-data.ts
import { CatalogGroup } from '@/types/group'

export const CATALOG_GROUPS: CatalogGroup[] = [
  {
    id: 'seoul-jazz-2025',
    name: '서울재즈페스티벌 2025',
    category: 'FESTIVAL',
    color: 'purple',
    icon: 'music',
    description: '올림픽공원에서 펼쳐지는 재즈의 향연',
    tickets: [...],
    totalTickets: 12,
    collectedTickets: 8,
    collectors: 245,
    likes: 189
  },
  // ...
]

export const getGroupById = (id: string) => {
  return CATALOG_GROUPS.find(group => group.id === id)
}
```

---

## 배포 가이드

### 1. 빌드

```bash
cd client-web
npm run build
# ✓ Exported as static HTML to: out/

cd ../admin
npm run build
# ✓ Exported as static HTML to: out/
```

### 2. nginx 설정

```nginx
# /etc/nginx/sites-available/otbook

server {
    listen 80;
    server_name otbook.example.com;

    # Client-Web
    location / {
        root /home/gurwls2399/client;
        try_files $uri $uri.html $uri/ /index.html;
    }

    # Admin
    location /admin {
        alias /home/gurwls2399/admin;
        try_files $uri $uri.html $uri/ /admin/index.html;
    }

    # Gzip 압축
    gzip on;
    gzip_types text/css application/javascript application/json;

    # 정적 파일 캐싱
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 배포 스크립트

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🏗️  Building projects..."

cd client-web
npm run build
cd ../admin
npm run build
cd ..

echo "📦 Deploying to server..."

rsync -avz --delete client-web/out/ user@server:/home/gurwls2399/client/
rsync -avz --delete admin/out/ user@server:/home/gurwls2399/admin/

echo "🔄 Reloading nginx..."
ssh user@server 'sudo systemctl reload nginx'

echo "✅ Deployment complete!"
```

---

## 작업 이력

### 2026-02-27 - 프로젝트 초기화
- [x] Next.js 프로젝트 생성 (client-web, admin)
- [x] TypeScript + Tailwind CSS 설정
- [x] Static Export 설정 (`next.config.ts`)
- [x] 디자인 시스템 적용 (시네마 다크 테마)
- [x] .claude 디렉토리 구조 설정
- [x] ai-studio에서 가이드 문서 가져오기
- [x] PROJECT.md 작성
- [x] CLAUDE.md 작성 (이 파일)

### 향후 작업
- [ ] otbook 레거시 페이지 포팅
- [ ] 공통 컴포넌트 라이브러리 구축
- [ ] Mock 데이터 TypeScript 변환
- [ ] Admin 페이지 개발
- [ ] Backend API 개발 (NestJS)
- [ ] Frontend-Backend 연동
- [ ] 배포 자동화

---

## 참고 문서

- [PROJECT.md](.claude/PROJECT.md) - 프로젝트 개요 및 기술 스택
- [getting-started-guide.md](.claude/guides/getting-started-guide.md) - 시작 가이드
- [frontend-guide.md](.claude/guides/frontend-guide.md) - 프론트엔드 개발 가이드
- [deployment-guide.md](.claude/guides/deployment-guide.md) - 배포 가이드
- [otbook CLAUDE.md](../otbook/CLAUDE.md) - 레거시 프로젝트 문서

---

**Claude Code로 개발 시 이 문서를 참고하여 작업하세요.**
