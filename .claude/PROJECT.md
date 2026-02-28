# OTBOOK - 프로젝트 정보

> **Last Updated:** 2026-02-28 | **Version:** 2.0.0

## 프로젝트 개요

OTBOOK은 수집가들이 자신이 소장한 오리지널 티켓(콘서트, 스포츠, 뮤지컬, 전시 등)을 디지털로 보관하고 다른 컬렉터들과 공유하는 모바일 웹 애플리케이션입니다.

**참고 레퍼런스**: https://icu.gg/card/list (카드 컬렉션 커뮤니티)

## 기술 스택

### Frontend (Client & Admin)
- **Framework**: Next.js 15+ (App Router) ✅
- **Language**: TypeScript 5+ ✅
- **Styling**: Tailwind CSS 3.4+ ✅
- **Authentication**: NextAuth.js 4.24+ (Google OAuth) ✅
- **HTTP Client**: Axios 1.13+ ✅
- **Icons**: Lucide React 0.575+ ✅
- **Runtime**: React 19+ ✅

### Backend (구현 완료)
- **Framework**: NestJS 11+ (TypeScript) ✅
- **Database**: SQLite + TypeORM 0.3+ ✅
- **Authentication**: JWT, Passport ✅
- **File Upload**: Multer ✅
- **Event System**: EventEmitter ✅

### Infrastructure
- **Process Manager**: PM2 (추천) ✅
- **Web Server**: nginx (리버스 프록시, 선택 사항)
- **Deployment**: SSR/CSR 동적 배포 ✅

## 프로젝트 구조

```
stub/
├── .claude/                    # Claude Code 설정
│   ├── PROJECT.md              # 프로젝트 정보 (이 파일)
│   ├── guides/                 # 개발 가이드
│   │   ├── getting-started-guide.md
│   │   ├── frontend-guide.md
│   │   ├── deployment-guide.md
│   │   ├── error-handling-guide.md
│   │   ├── security-guide.md
│   │   └── testing-guide.md
│   └── specs/                  # 기능 스펙 문서
│
├── client-web/                 # 고객용 프론트엔드
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈 페이지
│   │   └── globals.css         # 전역 스타일
│   ├── components/             # 컴포넌트
│   ├── public/                 # 정적 파일
│   ├── next.config.ts          # Next.js 설정 (static export)
│   ├── tailwind.config.ts      # Tailwind CSS 설정
│   ├── tsconfig.json           # TypeScript 설정
│   └── package.json
│
├── admin/                      # 어드민 프론트엔드
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   ├── public/
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                     # 백엔드 (NestJS) ✅
│   ├── src/
│   │   ├── main.ts             # 진입점
│   │   ├── app.module.ts       # 루트 모듈
│   │   ├── database/           # TypeORM 설정
│   │   │   ├── entities/       # 엔티티 정의
│   │   │   └── migrations/     # DB 마이그레이션
│   │   ├── auth/               # 인증 (JWT, OAuth)
│   │   ├── users/              # 사용자 모듈
│   │   ├── categories/         # 카테고리 모듈
│   │   ├── catalog-groups/     # 그룹 모듈
│   │   ├── catalog-items/      # 티켓 모듈
│   │   ├── stubs/              # Stub 모듈
│   │   ├── collections/        # 컬렉션 모듈
│   │   ├── likes/              # 좋아요 모듈
│   │   ├── follows/            # 팔로우 모듈
│   │   ├── notifications/      # 알림 모듈
│   │   ├── banners/            # 배너 모듈
│   │   ├── achievements/       # 업적 모듈
│   │   └── upload/             # 파일 업로드
│   ├── database.sqlite         # SQLite DB
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 디자인 시스템 — 시네마 테마

### 컨셉
영화관 분위기. 어두운 공간에서 빛나는 티켓처럼, 딥 다크 배경에 골드 포인트 컬러

### 핵심 원칙
- 배경은 최대한 어둡게 (`#0a0a0a`) — 관객석처럼
- 액센트는 골드 (`#c9a84c`) — 마키 전구처럼
- 텍스트는 따뜻한 아이보리 (`#f0ece4`)
- 카드별 컬러 그라디언트 유지 — 어두운 공간의 컬러풀한 포스터 효과

### 타이포그래피
| 폰트 | 용도 |
|------|------|
| `Bebas Neue` | 타이틀, 헤더, 숫자 강조 (대문자, 넓은 자간) |
| `Noto Sans KR` | 본문, UI 텍스트 |
| `DM Mono` | 메타 정보, 라벨, 날짜, 카운트 |

### 색상 팔레트
| 변수 | 값 | 용도 |
|------|-----|------|
| `--bg` | `#0a0a0a` | 앱 배경 (딥 다크) |
| `--surface` | `#141414` | 헤더/섹션 배경 |
| `--card` | `#1c1c1c` | 카드 배경 |
| `--border` | `#2a2a2a` | 구분선 |
| `--gold` | `#c9a84c` | 골드 강조 |
| `--gold-lt` | `#f0d07a` | 밝은 골드 |
| `--red` | `#e03a3a` | 경고/HOT 표시 |
| `--txt` | `#f0ece4` | 주 텍스트 |
| `--txt-muted` | `#7a7068` | 보조 텍스트 |

## 개발 환경 포트

| 서비스 | 포트 | 설명 | 상태 |
|--------|------|------|------|
| Client-Web (Dev) | 3000 | 고객용 Next.js 개발 서버 | ✅ |
| Admin (Dev) | 3001 | 어드민 Next.js 개발 서버 | ✅ |
| Server (Dev) | 3002 | NestJS API 서버 | ✅ |
| Production | 80 | nginx 리버스 프록시 (선택 사항) | ⏳ |

## 배포 방식

### SSR/CSR 동적 배포 (현재)
```bash
# 1. 빌드
cd client-web && npm run build  # Next.js 빌드
cd admin && npm run build       # Next.js 빌드
cd server && npm run build      # NestJS 빌드

# 2. PM2로 프로세스 실행
pm2 start npm --name "otbook-client" -- start  # 포트 3000
pm2 start npm --name "otbook-admin" -- start   # 포트 3001
pm2 start dist/main.js --name "otbook-server"  # 포트 3002

# 3. PM2 상태 확인
pm2 status
pm2 logs

# 4. 시스템 부팅 시 자동 실행 설정
pm2 startup
pm2 save
```

### Nginx 리버스 프록시 (선택 사항)
```nginx
server {
    listen 80;
    server_name otbook.example.com;

    location / {
        proxy_pass http://localhost:3000;  # Client-Web
    }

    location /api {
        proxy_pass http://localhost:3002;  # Server
    }

    location /admin {
        proxy_pass http://localhost:3001;  # Admin
    }
}
```

## 주요 기능

### 사용자 기능 (Client-Web)
- ✅ **인증**: Google OAuth 로그인, 온보딩 프로세스
- ✅ **홈**: 배너, 통계, 추천/인기/최근 컬렉션
- ✅ **검색**: 실시간 검색, 카테고리 필터, 최근 검색어
- ✅ **카탈로그**: 그룹 목록/상세, 티켓 수집/해제, 이미지 업로드
- ✅ **컬렉션**: 생성/수정/삭제, 공개/비공개, 좋아요/댓글
- ✅ **마이 페이지**: 내 티켓, 좋아요, 업적, 설정
- ✅ **소셜**: 팔로우/언팔로우, 팔로워/팔로잉 목록
- ✅ **알림**: 실시간 알림, 읽음/안읽음 처리

### 관리자 기능 (Admin)
- ✅ **대시보드**: 통계 (유저, 티켓, 그룹, 컬렉션)
- ✅ **사용자 관리**: 목록, 검색, 권한 변경 (USER/ADMIN)
- ✅ **티켓 관리**: CRUD (생성, 수정, 삭제)
- ✅ **배너 관리**: 등록, 순서 조정, 활성화/비활성화
- ✅ **공지 발송**: 시스템 알림 전체 발송

### 백엔드 API (Server)
- ✅ **인증**: JWT, Google OAuth, 어드민 가드
- ✅ **RESTful API**: 모든 엔티티 CRUD
- ✅ **파일 업로드**: Multer 기반 이미지 업로드
- ✅ **이벤트 시스템**: EventEmitter로 알림 자동 생성
- ✅ **데이터베이스**: TypeORM + SQLite, 마이그레이션

## 레거시 참조

이 프로젝트는 순수 HTML/CSS/JS로 작성된 [otbook 프로토타입](../otbook/)을 Next.js + NestJS 풀스택으로 마이그레이션한 것입니다.

- ✅ 기존 디자인 시스템과 UI/UX 유지
- ✅ React 컴포넌트로 재구성하여 재사용성 향상
- ✅ TypeScript 도입으로 타입 안정성 확보
- ✅ NestJS 백엔드로 완전한 풀스택 구현

## 로드맵

### Phase 1 - 프로젝트 구조 설정 ✅ (2026-02-27)
- [x] Next.js 프로젝트 초기화 (client-web, admin)
- [x] TypeScript + Tailwind CSS 설정
- [x] 디자인 시스템 적용

### Phase 2 - Frontend 개발 ✅ (2026-02-28)
- [x] 모든 페이지 Next.js로 포팅
  - [x] 홈 (`app/page.tsx`)
  - [x] 로그인 (`app/login/page.tsx`)
  - [x] 온보딩 (`app/onboarding/page.tsx`)
  - [x] 검색 (`app/search/page.tsx`)
  - [x] 카탈로그 목록 (`app/catalog/page.tsx`)
  - [x] 카탈로그 상세 (`app/catalog/[id]/page.tsx`)
  - [x] 컬렉션 (`app/collection/`)
  - [x] 마이 페이지 (`app/my/page.tsx`)
  - [x] 프로필 편집 (`app/my/edit/page.tsx`)
  - [x] 팔로우/팔로워 (`app/my/follows/page.tsx`)
  - [x] 알림 (`app/notifications/page.tsx`)
- [x] 공통 컴포넌트 작성
  - [x] Header, Navigation
  - [x] Banner, QuickStats
  - [x] CategoryFilter
  - [x] TicketCard, LoadingOverlay
  - [x] Providers (NextAuth)
- [x] Admin 페이지 개발
  - [x] 대시보드 (통계)
  - [x] 사용자 관리 (권한 변경)
  - [x] 티켓 관리 (CRUD)
  - [x] 배너 관리 (순서 조정)
  - [x] 공지 발송 (시스템 알림)

### Phase 3 - Backend API ✅ (2026-02-28)
- [x] NestJS 프로젝트 초기화
- [x] TypeORM + SQLite 설정
- [x] RESTful API 구현
  - [x] 인증 (JWT, Google OAuth)
  - [x] 티켓/그룹 CRUD
  - [x] 사용자 CRUD
  - [x] Stub (수집) CRUD
  - [x] 좋아요, 팔로우 CRUD
  - [x] 컬렉션 CRUD
  - [x] 알림 CRUD (EventEmitter)
  - [x] 배너 CRUD
  - [x] 파일 업로드 (multer)
- [x] Frontend-Backend API 연동
  - [x] Axios 클라이언트
  - [x] TypeScript 타입 정의
  - [x] NextAuth 세션 관리

### Phase 4 - 배포 및 최적화 ⏳ (계획)
- [ ] PM2 프로세스 관리 설정
- [ ] Nginx 리버스 프록시 설정
- [ ] 이미지 최적화 (Next.js Image, CDN)
- [ ] SEO 최적화 (메타태그, Open Graph)
- [ ] 성능 모니터링 (Sentry, Analytics)
- [ ] CI/CD 파이프라인 (GitHub Actions)
- [ ] PWA 설정 (Service Worker)
- [ ] 검색 고도화 (Elasticsearch)
- [ ] 실시간 알림 (WebSocket, SSE)

---

## otbook 레거시 기능 목록

### 홈 (index.html)
- 배너 슬라이더 (자동 재생, 터치 스와이프)
- Quick Stats (등록 티켓/컬렉터/공유 횟수)
- 카테고리 필터 칩
- 추천 컬렉션 (가로 스크롤)
- 지금 인기 (TOP5)
- 주목할 컬렉터
- 최근 등록 (2열 그리드)

### 검색 (search.html)
- 실시간 검색
- 카테고리 필터
- 최근 검색어
- 인기 검색어 TOP10
- 카테고리별 탐색 (6개 카드)

### 카탈로그 (catalog.html)
- Stats Strip
- 카테고리 필터 탭
- 그룹 카드 그리드
- 카테고리별 그룹 표시

### 카탈로그 상세 (catalog-detail.html)
- Hero 영역 (SVG 아이콘 + 그라디언트)
- Meta Strip
- 티켓 탭 (전체/수집완료/미수집)
- 2×2 티켓 페이저 (슬라이드 애니메이션)
- 티켓 상세 모달

### 마이 페이지 (my.html)
- 프로필 헤더
- 컬렉션 탭 (내 티켓/좋아요/업적/설정)
- 업적 시스템 (SVG 아이콘)
- 설정 메뉴

---

**이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.**
