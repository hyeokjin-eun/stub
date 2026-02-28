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

### 서버 실행

```bash
# Server (백엔드) 개발 서버
cd server
npm install
npm run start:dev
# → http://localhost:3002

# 데이터베이스 마이그레이션 실행
npm run migration:run
```

### 빌드 및 배포

```bash
# Client-Web 빌드
cd client-web
npm run build
npm run start  # 프로덕션 서버 실행 (포트 3000)

# Admin 빌드
cd admin
npm run build
npm run start  # 프로덕션 서버 실행 (포트 3001)

# Server 빌드
cd server
npm run build
npm run start:prod  # 프로덕션 서버 실행 (포트 3002)
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
│   │   ├── layout.tsx          # 루트 레이아웃 ✅
│   │   ├── page.tsx            # 홈 페이지 ✅
│   │   ├── globals.css         # 전역 스타일 (시네마 테마) ✅
│   │   ├── login/              # 로그인 페이지 ✅
│   │   ├── onboarding/         # 온보딩 페이지 ✅
│   │   ├── search/             # 검색 페이지 ✅
│   │   ├── catalog/            # 카탈로그 목록 ✅
│   │   │   └── [id]/           # 카탈로그 상세 ✅
│   │   ├── collection/         # 컬렉션 관련 ✅
│   │   │   ├── page.tsx        # 컬렉션 목록
│   │   │   ├── new/            # 새 컬렉션 생성
│   │   │   └── [id]/           # 컬렉션 상세
│   │   ├── my/                 # 마이 페이지 ✅
│   │   │   ├── page.tsx        # 프로필 메인
│   │   │   ├── edit/           # 프로필 편집
│   │   │   └── follows/        # 팔로우/팔로워
│   │   ├── notifications/      # 알림 페이지 ✅
│   │   ├── api/                # API Routes
│   │   │   └── auth/           # NextAuth 라우트 ✅
│   │   └── api-test/           # API 테스트 페이지 ✅
│   ├── components/             # React 컴포넌트
│   │   ├── Header.tsx          # 공통 헤더 ✅
│   │   ├── Navigation.tsx      # 하단 네비게이션 ✅
│   │   ├── Banner.tsx          # 배너 컴포넌트 ✅
│   │   ├── QuickStats.tsx      # 통계 표시 ✅
│   │   ├── CategoryFilter.tsx  # 카테고리 필터 ✅
│   │   ├── TicketCard.tsx      # 티켓 카드 ✅
│   │   ├── Providers.tsx       # Context Providers ✅
│   │   └── LoadingOverlay.tsx  # 로딩 오버레이 ✅
│   ├── lib/                    # 유틸리티
│   │   ├── api/                # API 클라이언트 ✅
│   │   │   ├── client.ts       # Axios 인스턴스
│   │   │   ├── types.ts        # 타입 정의
│   │   │   ├── auth.ts         # 인증 API
│   │   │   ├── categories.ts   # 카테고리 API
│   │   │   ├── catalogItems.ts # 티켓 API
│   │   │   ├── catalogGroups.ts # 그룹 API
│   │   │   ├── likes.ts        # 좋아요 API
│   │   │   ├── follows.ts      # 팔로우 API
│   │   │   ├── users.ts        # 사용자 API
│   │   │   ├── stubs.ts        # Stub API
│   │   │   ├── collections.ts  # 컬렉션 API
│   │   │   ├── banners.ts      # 배너 API
│   │   │   └── notifications.ts # 알림 API
│   │   ├── hooks/              # Custom Hooks ✅
│   │   │   └── useAuth.ts
│   │   └── mockData.ts         # Mock 데이터 ✅
│   ├── middleware.ts           # NextAuth 미들웨어 ✅
│   ├── types/                  # 타입 정의 ✅
│   │   └── next-auth.d.ts
│   ├── public/                 # 정적 파일
│   ├── next.config.ts          # Next.js 설정 ✅
│   ├── tailwind.config.ts      # Tailwind 설정 ✅
│   ├── tsconfig.json
│   └── package.json
│
├── admin/                      # 어드민 프론트엔드 (Next.js)
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃 ✅
│   │   ├── page.tsx            # 대시보드 ✅
│   │   ├── globals.css         # 어드민 스타일 ✅
│   │   ├── login/              # 어드민 로그인 ✅
│   │   ├── users/              # 사용자 관리 ✅
│   │   ├── tickets/            # 티켓 관리 ✅
│   │   ├── banners/            # 배너 관리 ✅
│   │   └── notify/             # 공지 발송 ✅
│   ├── components/
│   │   └── BottomNav.tsx       # 하단 네비게이션 ✅
│   ├── lib/
│   │   └── api.ts              # Admin API 클라이언트 ✅
│   ├── middleware.ts           # 어드민 인증 미들웨어 ✅
│   ├── public/
│   ├── next.config.ts          # Next.js 설정 ✅
│   ├── tailwind.config.ts      # Tailwind 설정 ✅
│   ├── tsconfig.json
│   └── package.json
│
├── server/                     # 백엔드 (NestJS)
│   ├── src/
│   │   ├── main.ts             # 진입점 ✅
│   │   ├── app.module.ts       # 루트 모듈 ✅
│   │   ├── database/           # 데이터베이스 설정 ✅
│   │   │   ├── data-source.ts  # TypeORM 설정
│   │   │   ├── database.module.ts
│   │   │   ├── entities/       # 엔티티 정의
│   │   │   │   ├── user.entity.ts ✅
│   │   │   │   ├── category.entity.ts ✅
│   │   │   │   ├── catalog-group.entity.ts ✅
│   │   │   │   ├── catalog-item.entity.ts ✅
│   │   │   │   ├── stub.entity.ts ✅
│   │   │   │   ├── collection.entity.ts ✅
│   │   │   │   ├── like.entity.ts ✅
│   │   │   │   ├── follow.entity.ts ✅
│   │   │   │   ├── notification.entity.ts ✅
│   │   │   │   └── banner.entity.ts ✅
│   │   │   └── migrations/     # DB 마이그레이션 ✅
│   │   ├── auth/               # 인증 모듈 ✅
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   └── guards/         # 인증 가드
│   │   │       └── admin.guard.ts ✅
│   │   ├── users/              # 사용자 모듈 ✅
│   │   ├── categories/         # 카테고리 모듈 ✅
│   │   ├── catalog-groups/     # 그룹 모듈 ✅
│   │   ├── catalog-items/      # 티켓 모듈 ✅
│   │   ├── stubs/              # Stub 모듈 ✅
│   │   ├── collections/        # 컬렉션 모듈 ✅
│   │   ├── likes/              # 좋아요 모듈 ✅
│   │   ├── follows/            # 팔로우 모듈 ✅
│   │   ├── notifications/      # 알림 모듈 ✅
│   │   ├── banners/            # 배너 모듈 ✅
│   │   ├── achievements/       # 업적 모듈 ✅
│   │   └── upload/             # 파일 업로드 모듈 ✅
│   ├── database.sqlite         # SQLite DB 파일 ✅
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 기술 스택

| 영역 | 기술 | 버전 | 목적 | 상태 |
|------|------|------|------|------|
| **Framework** | Next.js | 15+ | App Router, SSR/CSR | ✅ 구현완료 |
| **Language** | TypeScript | 5+ | 타입 안정성 | ✅ 구현완료 |
| **Styling** | Tailwind CSS | 3.4+ | 유틸리티 기반 스타일링 | ✅ 구현완료 |
| **Runtime** | React | 19+ | UI 라이브러리 | ✅ 구현완료 |
| **Authentication** | NextAuth.js | 4.24+ | OAuth 인증 (Google) | ✅ 구현완료 |
| **Backend** | NestJS | 11+ | RESTful API 서버 | ✅ 구현완료 |
| **Database** | SQLite + TypeORM | 5+ / 0.3+ | 데이터 영속성 | ✅ 구현완료 |
| **HTTP Client** | Axios | 1.13+ | API 통신 | ✅ 구현완료 |
| **Icons** | Lucide React | 0.575+ | 아이콘 라이브러리 | ✅ 구현완료 |

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

## 컴포넌트 설계 (구현 완료)

### 공통 컴포넌트 (`client-web/components/`)

```typescript
// Header.tsx ✅
// 로고, 알림, 검색 버튼 포함
export default function Header()

// Navigation.tsx ✅
// 하단 네비게이션 (홈, 검색, 카탈로그, 마이)
export default function Navigation()

// Banner.tsx ✅
// 홈 배너 슬라이더 (자동 순환)
export default function Banner()

// QuickStats.tsx ✅
// 통계 표시 (총 티켓, 컬렉션, 컬렉터)
interface QuickStatsProps {
  totalTickets: number
  totalCollections: number
  totalCollectors: number
  loading: boolean
}

// CategoryFilter.tsx ✅
// 카테고리 필터 칩 (가로 스크롤)
interface CategoryFilterProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (code: string) => void
}

// TicketCard.tsx ✅
// 티켓 카드 (그라디언트 배경, 등급 배지)
interface TicketCardProps {
  ticket: CatalogItem
  number: string
  onClick: () => void
}

// LoadingOverlay.tsx ✅
// 전체 화면 로딩 오버레이
export function LoadingOverlay()

// Providers.tsx ✅
// NextAuth SessionProvider 래퍼
export function Providers({ children })
```

### Admin 컴포넌트 (`admin/components/`)

```typescript
// BottomNav.tsx ✅
// 어드민 하단 네비게이션
export default function BottomNav()
```

---

## 페이지 라우팅 (구현 완료)

### Client-Web (고객용)

| 경로 | 설명 | 상태 |
|------|------|------|
| `/` | 홈 페이지 (추천, 트렌딩, 최근 등록) | ✅ |
| `/login` | 로그인 (Google OAuth) | ✅ |
| `/onboarding` | 온보딩 프로세스 | ✅ |
| `/search` | 검색 페이지 | ✅ |
| `/catalog` | 카탈로그 목록 (카테고리별 그룹) | ✅ |
| `/catalog/[id]` | 카탈로그 상세 (티켓 목록, 2x2 슬라이더) | ✅ |
| `/collection` | 컬렉션 목록 | ✅ |
| `/collection/new` | 새 컬렉션 생성 | ✅ |
| `/collection/[id]` | 컬렉션 상세 | ✅ |
| `/my` | 마이 페이지 (티켓, 좋아요, 업적, 설정) | ✅ |
| `/my/edit` | 프로필 편집 | ✅ |
| `/my/follows` | 팔로우/팔로워 목록 | ✅ |
| `/notifications` | 알림 목록 | ✅ |
| `/api-test` | API 테스트 페이지 (개발용) | ✅ |

### Admin (관리자용)

| 경로 | 설명 | 상태 |
|------|------|------|
| `/` | 대시보드 (통계, 메뉴) | ✅ |
| `/login` | 어드민 로그인 | ✅ |
| `/users` | 사용자 관리 (목록, 권한 변경) | ✅ |
| `/tickets` | 티켓 관리 (CRUD) | ✅ |
| `/banners` | 배너 관리 (등록, 순서 조정) | ✅ |
| `/notify` | 시스템 알림 전체 발송 | ✅ |

**URL 예시:**
- Client: `http://localhost:3000/`
- Client: `http://localhost:3000/catalog/49`
- Admin: `http://localhost:3001/users`

---

## 데이터 구조 (TypeScript)

### API 타입 정의 (`client-web/lib/api/types.ts`) ✅

```typescript
// 사용자
export interface User {
  id: number
  email: string
  nickname: string
  bio?: string
  avatar_url?: string
  phone?: string
  birth_date?: string
  onboarding_completed: boolean
  role?: 'USER' | 'ADMIN'
  oauth_provider?: string
  oauth_id?: string
  created_at: string
  updated_at: string
}

// 카테고리
export interface Category {
  id: number
  code: string        // 'MUSIC', 'SPORTS', 'CINEMA', etc.
  name: string
  icon: string
  color: string
  created_at: string
}

// 카탈로그 그룹
export interface CatalogGroup {
  id: number
  parent_group_id?: number
  category_id: number
  category?: Category
  name: string
  description?: string
  thumbnail_url?: string
  color?: string
  view_count: number
  ticket_count: number
  created_at: string
  updated_at: string
}

// 카탈로그 아이템 (티켓)
export interface CatalogItem {
  id: number
  catalog_group_id: number
  catalog_group?: CatalogGroup
  category_id: number
  category?: Category
  title: string
  description?: string
  image_url?: string
  metadata?: CatalogItemMetadata
  color?: string
  created_at: string
  updated_at: string
}

// Stub (사용자가 수집한 티켓)
export interface Stub {
  id: number
  user_id: number
  catalog_item_id: number
  catalog_item?: CatalogItem
  image_url?: string
  status: 'collected' | 'uncollected'
  created_at: string
  updated_at: string
}

// 컬렉션
export interface Collection {
  id: number
  user_id: number
  user?: User
  title: string
  description?: string
  is_public: boolean
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
}

// 좋아요
export interface Like {
  id: number
  user_id: number
  catalog_item_id: number
  created_at: string
}

// 팔로우
export interface Follow {
  id: number
  follower_id: number
  following_id: number
  created_at: string
}

// 알림
export interface Notification {
  id: number
  user_id: number
  type: 'LIKE' | 'FOLLOW' | 'COMMENT' | 'SYSTEM'
  title: string
  content: string
  link?: string
  is_read: boolean
  created_at: string
}

// 업적
export interface Achievement {
  code: string
  name: string
  description: string
  icon: string
  achieved: boolean
}

// 배너
export interface Banner {
  id: number
  title: string
  image_url: string
  link_url?: string
  order_index: number
  is_active: boolean
  created_at: string
}
```

### 데이터베이스 엔티티 (`server/src/database/entities/`) ✅

- `user.entity.ts` - 사용자
- `category.entity.ts` - 카테고리
- `catalog-group.entity.ts` - 카탈로그 그룹
- `catalog-item.entity.ts` - 티켓
- `stub.entity.ts` - 수집 티켓
- `collection.entity.ts` - 컬렉션
- `like.entity.ts` - 좋아요
- `follow.entity.ts` - 팔로우
- `notification.entity.ts` - 알림
- `banner.entity.ts` - 배너
- `user-achievement.entity.ts` - 사용자 업적

---

## 구현 완료 항목

### Frontend (Client-Web)

#### 공통 작업
- [x] CSS 변수 → globals.css 적용
- [x] Lucide React 아이콘 라이브러리 적용
- [x] TypeScript 타입 정의 완료
- [x] CSS 애니메이션 (fade-in, slide-up 등)

#### 페이지별 작업

**홈 (`app/page.tsx`)** ✅
- [x] 배너 슬라이더 컴포넌트 (자동 순환)
- [x] Quick Stats 섹션 (총 티켓, 컬렉션, 컬렉터)
- [x] 카테고리 필터 칩 (현재 영화 카테고리 고정)
- [x] 추천 컬렉션 가로 스크롤
- [x] 지금 인기 TOP5 리스트 (view_count 기준)
- [x] 최근 등록 2열 그리드 (created_at 기준)
- [x] API 연동 (categories, catalogItems, catalogGroups)

**검색 (`app/search/page.tsx`)** ✅
- [x] 검색바 (실시간 입력)
- [x] 카테고리 필터 칩
- [x] 최근 검색어 (로컬 스토리지)
- [x] 인기 검색어 API 연동
- [x] 카테고리별 탐색 카드
- [x] 검색 결과 그리드

**카탈로그 (`app/catalog/page.tsx`)** ✅
- [x] Stats Strip (총 티켓, 그룹, 내 수집, 달성률)
- [x] 카테고리 필터 탭 (현재 영화 카테고리 고정)
- [x] 그룹 카드 그리드 (2열)
- [x] 정렬 옵션 (인기순, 최신순, 번호순)
- [x] 카테고리별 섹션 헤더
- [x] 세션 기반 내 수집 현황 표시

**카탈로그 상세 (`app/catalog/[id]/page.tsx`)** ✅
- [x] Hero 영역 (썸네일 + 그라디언트)
- [x] Meta Strip (티켓 수, 조회수, 좋아요)
- [x] 티켓 탭 (전체/수집완료/미수집)
- [x] 2×2 티켓 그리드 (페이지네이션)
- [x] 티켓 상세 모달
- [x] 티켓 수집/해제 기능
- [x] 이미지 업로드 (multer)

**마이 페이지 (`app/my/page.tsx`)** ✅
- [x] 프로필 헤더 (아바타, 닉네임, 바이오)
- [x] 통계 (티켓, 팔로워, 팔로잉)
- [x] 컬렉션 탭 전환 (내 티켓, 좋아요, 업적, 설정)
- [x] 내 티켓 그리드 (Stub 기반)
- [x] 좋아요한 티켓 그리드
- [x] 업적 시스템 (획득/잠김)
- [x] 설정 메뉴 (프로필 편집, 알림, 계정 탈퇴, 로그아웃)

**기타 페이지**
- [x] 로그인 (`app/login/page.tsx`) - Google OAuth
- [x] 온보딩 (`app/onboarding/page.tsx`)
- [x] 프로필 편집 (`app/my/edit/page.tsx`)
- [x] 팔로우/팔로워 (`app/my/follows/page.tsx`)
- [x] 알림 (`app/notifications/page.tsx`)
- [x] 컬렉션 (`app/collection/`)
  - [x] 목록 (`page.tsx`)
  - [x] 생성 (`new/page.tsx`)
  - [x] 상세 (`[id]/page.tsx`)

### Backend (Server)

#### 모듈 구현 ✅
- [x] **AuthModule** - JWT 인증, Google OAuth, 어드민 가드
- [x] **UsersModule** - CRUD, 팔로우/팔로워, 프로필 편집, 계정 삭제
- [x] **CategoriesModule** - 카테고리 조회
- [x] **CatalogGroupsModule** - 그룹 CRUD, 조회수 증가
- [x] **CatalogItemsModule** - 티켓 CRUD, 카테고리별 조회
- [x] **StubsModule** - 티켓 수집/해제, 내 티켓 조회
- [x] **CollectionsModule** - 컬렉션 CRUD, 공개/비공개
- [x] **LikesModule** - 좋아요/취소, 내 좋아요 조회
- [x] **FollowsModule** - 팔로우/언팔로우, 팔로워/팔로잉 조회
- [x] **NotificationsModule** - 알림 생성/조회/읽음 처리, EventEmitter 연동
- [x] **BannersModule** - 배너 CRUD, 순서 조정
- [x] **AchievementsModule** - 업적 조회
- [x] **UploadModule** - 이미지 업로드 (multer)

#### 데이터베이스 ✅
- [x] TypeORM 설정
- [x] SQLite 사용
- [x] 마이그레이션 파일
- [x] 엔티티 관계 설정 (OneToMany, ManyToOne)

### Admin

#### 페이지 구현 ✅
- [x] 대시보드 (`app/page.tsx`) - 통계 카드, 메뉴
- [x] 사용자 관리 (`app/users/page.tsx`) - 목록, 검색, 권한 변경
- [x] 티켓 관리 (`app/tickets/page.tsx`) - CRUD
- [x] 배너 관리 (`app/banners/page.tsx`) - 등록, 순서 조정
- [x] 공지 발송 (`app/notify/page.tsx`) - 시스템 알림 전체 발송
- [x] 로그인 (`app/login/page.tsx`) - 어드민 토큰 인증

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

### API 클라이언트 사용법

```typescript
// client-web/lib/api/ 사용 예시

import { catalogGroupsApi, catalogItemsApi, stubsApi } from '@/lib/api'

// 카탈로그 그룹 목록 조회
const groups = await catalogGroupsApi.getAll({ limit: 100 })

// 특정 그룹 상세 조회
const group = await catalogGroupsApi.getById(49)

// 티켓 목록 조회 (카테고리별 필터)
const tickets = await catalogItemsApi.getAll({
  category_id: 1,
  limit: 20
})

// 티켓 수집
await stubsApi.collect(ticketId, { image_url: '...' })

// 내 티켓 목록 조회
const myStubs = await stubsApi.getMyStubs()
```

### 환경 변수 설정

```bash
# client-web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3002

# server/.env (필요 시)
PORT=3002
DATABASE_PATH=./database.sqlite
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

### 2. PM2 프로세스 관리 (추천)

```bash
# PM2 설치
npm install -g pm2

# Client-Web 실행
cd client-web
npm run build
pm2 start npm --name "otbook-client" -- start

# Admin 실행
cd admin
npm run build
pm2 start npm --name "otbook-admin" -- start

# Server 실행
cd server
npm run build
pm2 start dist/main.js --name "otbook-server"

# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs otbook-server

# 재시작
pm2 restart all

# 시스템 부팅 시 자동 실행
pm2 startup
pm2 save
```

### 3. Nginx 리버스 프록시 (선택 사항)

```nginx
# /etc/nginx/sites-available/otbook

server {
    listen 80;
    server_name otbook.example.com;

    # Client-Web (Next.js SSR)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Server
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Admin
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Gzip 압축
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

---

## 작업 이력

### 2026-02-27 - 프로젝트 초기화
- [x] Next.js 프로젝트 생성 (client-web, admin)
- [x] TypeScript + Tailwind CSS 설정
- [x] 디자인 시스템 적용 (시네마 다크 테마)
- [x] .claude 디렉토리 구조 설정
- [x] PROJECT.md 작성
- [x] CLAUDE.md 작성 (이 파일)

### 2026-02-28 - 전체 기능 구현 완료
- [x] **Client-Web (고객용)** 전체 페이지 구현
  - [x] 홈, 로그인, 온보딩
  - [x] 검색, 카탈로그 목록/상세
  - [x] 컬렉션 목록/생성/상세
  - [x] 마이 페이지 (티켓, 좋아요, 업적, 설정)
  - [x] 프로필 편집, 팔로우, 알림
- [x] **Server (백엔드)** NestJS 기반 REST API
  - [x] 인증 (JWT, Google OAuth)
  - [x] 사용자, 카테고리, 그룹, 티켓 CRUD
  - [x] Stub (수집), 좋아요, 팔로우
  - [x] 컬렉션, 알림, 배너, 업적
  - [x] 파일 업로드 (multer)
  - [x] 데이터베이스 마이그레이션
- [x] **Admin (관리자)** 관리 페이지
  - [x] 대시보드 (통계)
  - [x] 사용자 관리 (권한 변경)
  - [x] 티켓 관리 (CRUD)
  - [x] 배너 관리 (순서 조정)
  - [x] 공지 발송 (시스템 알림)
- [x] **API 연동** 완료
  - [x] Axios 기반 API 클라이언트
  - [x] NextAuth 세션 관리
  - [x] TypeScript 타입 정의
- [x] **문서 최신화** (2026-02-28)
  - [x] CLAUDE.md 업데이트 (구현 현황 반영)

### 향후 개선 사항
- [ ] 검색 기능 고도화 (Elasticsearch 도입 검토)
- [ ] 이미지 최적화 (Next.js Image, CDN)
- [ ] 성능 최적화 (React Query, SWR)
- [ ] E2E 테스트 (Playwright)
- [ ] CI/CD 파이프라인 구축
- [ ] 모바일 앱 (React Native 검토)
- [ ] 실시간 알림 (WebSocket, SSE)

---

## 참고 문서

- [PROJECT.md](.claude/PROJECT.md) - 프로젝트 개요 및 기술 스택
- [getting-started-guide.md](.claude/guides/getting-started-guide.md) - 시작 가이드
- [frontend-guide.md](.claude/guides/frontend-guide.md) - 프론트엔드 개발 가이드
- [deployment-guide.md](.claude/guides/deployment-guide.md) - 배포 가이드
- [otbook CLAUDE.md](../otbook/CLAUDE.md) - 레거시 프로젝트 문서

---

**Claude Code로 개발 시 이 문서를 참고하여 작업하세요.**
