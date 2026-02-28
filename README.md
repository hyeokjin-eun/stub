# OTBOOK

> 수집가들을 위한 오리지널 티켓 컬렉션 앱

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 프로젝트 개요

OTBOOK은 콘서트, 스포츠, 뮤지컬, 전시 등의 오리지널 티켓을 디지털로 수집하고 다른 컬렉터들과 공유하는 모바일 웹 애플리케이션입니다.

**주요 기능:**
- 🔐 Google OAuth 로그인 및 온보딩
- 📸 티켓 디지털 수집 (이미지 업로드)
- 🎨 카테고리별 티켓 컬렉션 (영화, 음악, 스포츠 등)
- 🔍 실시간 검색 및 카테고리 필터링
- 💝 좋아요, 팔로우, 컬렉션 공유
- 📊 수집 통계 및 업적 시스템
- 🔔 실시간 알림 (좋아요, 팔로우, 댓글, 시스템)
- 👨‍💼 관리자 대시보드 (사용자, 티켓, 배너 관리)

**참고 레퍼런스**: [icu.gg/card/list](https://icu.gg/card/list) (카드 컬렉션 커뮤니티)

---

## 기술 스택

### Frontend
- **Next.js 15+** - React 프레임워크 (App Router, SSR/CSR)
- **TypeScript 5+** - 타입 안정성
- **Tailwind CSS 3.4+** - 유틸리티 기반 스타일링
- **React 19+** - UI 라이브러리
- **NextAuth.js 4.24+** - Google OAuth 인증
- **Axios 1.13+** - HTTP 클라이언트
- **Lucide React 0.575+** - 아이콘 라이브러리

### Backend
- **NestJS 11+** - TypeScript 기반 백엔드 프레임워크
- **TypeORM 0.3+** - ORM
- **SQLite 5+** - 데이터베이스 (프로덕션: PostgreSQL 고려)
- **Passport JWT** - JWT 인증
- **Multer** - 파일 업로드
- **EventEmitter** - 이벤트 기반 알림 시스템

### Infrastructure
- **PM2** - 프로세스 관리
- **nginx** - 리버스 프록시 (선택 사항)

---

## 빠른 시작

### 1. 사전 요구사항

- Node.js 18 이상
- npm, yarn, 또는 pnpm

### 2. 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd stub

# Client-Web 의존성 설치
cd client-web
npm install

# Admin 의존성 설치
cd ../admin
npm install

# Server 의존성 설치
cd ../server
npm install
```

### 3. 개발 서버 실행

```bash
# Client-Web (고객용)
cd client-web
npm run dev
# → http://localhost:3000

# Admin (관리자)
cd admin
npm run dev
# → http://localhost:3001

# Server (백엔드 API)
cd server
npm run start:dev
# → http://localhost:3002
```

### 4. 환경 변수 설정

```bash
# client-web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### 5. 데이터베이스 초기화

```bash
cd server
npm run migration:run
```

### 6. 빌드

```bash
# Client-Web 빌드
cd client-web
npm run build
npm run start  # 프로덕션 실행 (포트 3000)

# Admin 빌드
cd admin
npm run build
npm run start  # 프로덕션 실행 (포트 3001)

# Server 빌드
cd server
npm run build
npm run start:prod  # 프로덕션 실행 (포트 3002)
```

---

## 프로젝트 구조

```
stub/
├── .claude/                    # 프로젝트 문서
│   ├── PROJECT.md              # 프로젝트 상세 정보
│   ├── CLAUDE.md               # 개발 가이드
│   └── guides/                 # 개발 가이드 문서
│
├── client-web/                 # 고객용 프론트엔드
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 홈 페이지
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   └── globals.css         # 전역 스타일 (시네마 테마)
│   ├── components/             # React 컴포넌트
│   ├── lib/                    # 유틸리티, 데이터
│   ├── public/                 # 정적 파일
│   └── types/                  # TypeScript 타입
│
├── admin/                      # 어드민 프론트엔드
│   └── (동일한 구조)
│
├── server/                     # 백엔드 API
│   ├── src/
│   │   ├── main.ts             # 진입점
│   │   ├── app.module.ts       # 루트 모듈
│   │   ├── database/           # TypeORM 설정
│   │   │   ├── entities/       # 엔티티 (User, Category, CatalogGroup, CatalogItem, Stub, Collection, Like, Follow, Notification, Banner, Achievement)
│   │   │   ├── migrations/     # DB 마이그레이션
│   │   │   └── data-source.ts  # DataSource 설정
│   │   ├── auth/               # 인증 모듈 (JWT, Google OAuth)
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
│   │   └── upload/             # 파일 업로드 모듈
│   └── database.sqlite         # SQLite 데이터베이스
│
└── README.md                   # 이 파일
```

---

## 디자인 시스템

### 시네마 다크 테마

**컨셉**: 영화관의 마법 — 어두운 극장에서 빛나는 티켓

**색상 팔레트:**
```css
--bg: #0a0a0a;          /* 딥 다크 배경 */
--gold: #c9a84c;        /* 골드 액센트 */
--txt: #f0ece4;         /* 아이보리 텍스트 */
--card: #1c1c1c;        /* 카드 배경 */
```

**타이포그래피:**
- **Bebas Neue** - 타이틀, 헤더
- **Noto Sans KR** - 본문, UI
- **DM Mono** - 메타 정보, 라벨

---

## 주요 페이지

### Client-Web (고객용)

| 페이지 | 경로 | 설명 | 상태 |
|-------|------|------|------|
| 홈 | `/` | 배너, 추천/인기/최근 컬렉션 | ✅ |
| 로그인 | `/login` | Google OAuth 로그인 | ✅ |
| 온보딩 | `/onboarding` | 신규 사용자 온보딩 | ✅ |
| 검색 | `/search` | 실시간 검색, 카테고리 탐색 | ✅ |
| 카탈로그 | `/catalog` | 그룹별 티켓 목록 | ✅ |
| 카탈로그 상세 | `/catalog/[id]` | 티켓 수집/해제, 이미지 업로드 | ✅ |
| 컬렉션 | `/collection` | 컬렉션 목록 | ✅ |
| 컬렉션 생성 | `/collection/new` | 새 컬렉션 만들기 | ✅ |
| 컬렉션 상세 | `/collection/[id]` | 컬렉션 상세, 댓글, 좋아요 | ✅ |
| 마이 페이지 | `/my` | 내 티켓, 좋아요, 업적, 설정 | ✅ |
| 프로필 편집 | `/my/edit` | 닉네임, 바이오 수정 | ✅ |
| 팔로우 | `/my/follows` | 팔로워/팔로잉 목록 | ✅ |
| 알림 | `/notifications` | 알림 목록, 읽음 처리 | ✅ |

### Admin (관리자용)

| 페이지 | 경로 | 설명 | 상태 |
|-------|------|------|------|
| 대시보드 | `/` | 통계, 메뉴 | ✅ |
| 로그인 | `/login` | 어드민 토큰 인증 | ✅ |
| 사용자 관리 | `/users` | 목록, 검색, 권한 변경 | ✅ |
| 티켓 관리 | `/tickets` | CRUD | ✅ |
| 배너 관리 | `/banners` | 등록, 순서 조정 | ✅ |
| 공지 발송 | `/notify` | 시스템 알림 전체 발송 | ✅ |

---

## 개발 가이드

### 문서

- **[.claude/PROJECT.md](.claude/PROJECT.md)** - 프로젝트 상세 정보
- **[.claude/CLAUDE.md](.claude/CLAUDE.md)** - 개발 가이드
- **[.claude/guides/getting-started-guide.md](.claude/guides/getting-started-guide.md)** - 시작 가이드
- **[.claude/guides/database-guide.md](.claude/guides/database-guide.md)** - 데이터베이스 가이드
- **[.claude/guides/deployment-guide.md](.claude/guides/deployment-guide.md)** - 배포 가이드

### 코드 스타일

```typescript
// 컴포넌트 예시
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button
      className="px-6 py-3 rounded-xl bg-[#c9a84c] text-[#0a0a0a]"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

---

## 배포

### PM2 프로세스 관리

```bash
# 1. PM2 설치
npm install -g pm2

# 2. 빌드
cd client-web && npm run build
cd admin && npm run build
cd server && npm run build

# 3. PM2로 실행
pm2 start npm --name "otbook-client" -- start     # 포트 3000
pm2 start npm --name "otbook-admin" -- start      # 포트 3001
pm2 start dist/main.js --name "otbook-server"     # 포트 3002

# 4. PM2 상태 확인
pm2 status
pm2 logs

# 5. 시스템 부팅 시 자동 실행
pm2 startup
pm2 save
```

### Nginx 리버스 프록시 (선택 사항)

```nginx
server {
    listen 80;
    server_name otbook.example.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:3002;
    }

    location /admin {
        proxy_pass http://localhost:3001;
    }
}
```

자세한 내용은 **[배포 가이드](.claude/guides/deployment-guide.md)**를 참고하세요.

---

## 로드맵

### ✅ Phase 1 - 프로젝트 구조 (2026-02-27)
- [x] Next.js 프로젝트 초기화 (client-web, admin)
- [x] TypeScript + Tailwind CSS 설정
- [x] 디자인 시스템 적용 (시네마 다크 테마)

### ✅ Phase 2 - Frontend 개발 (2026-02-28)
- [x] 모든 페이지 Next.js 포팅 완료
  - [x] 홈, 로그인, 온보딩
  - [x] 검색, 카탈로그, 컬렉션
  - [x] 마이 페이지, 알림, 팔로우
- [x] 공통 컴포넌트 라이브러리 구축
- [x] API 클라이언트 (Axios) 연동
- [x] Admin 페이지 전체 개발

### ✅ Phase 3 - Backend API (2026-02-28)
- [x] NestJS 프로젝트 초기화
- [x] TypeORM + SQLite 설정
- [x] 11개 엔티티 생성
- [x] DB 마이그레이션 & 시드 데이터
- [x] RESTful API 전체 구현
  - [x] 인증 (JWT, Google OAuth)
  - [x] 티켓/그룹/카테고리 CRUD
  - [x] Stub (수집), 좋아요, 팔로우
  - [x] 컬렉션, 알림 (EventEmitter)
  - [x] 배너, 업적, 파일 업로드
- [x] Frontend-Backend 연동 완료

### 📅 Phase 4 - 배포 및 최적화 (계획)
- [ ] PM2 + Nginx 프로덕션 배포
- [ ] 이미지 최적화 (Next.js Image, CDN)
- [ ] SEO 최적화 (메타태그, Open Graph)
- [ ] 성능 모니터링 (Sentry, Analytics)
- [ ] CI/CD 파이프라인 (GitHub Actions)
- [ ] 검색 고도화 (Elasticsearch)
- [ ] 실시간 알림 (WebSocket, SSE)

---

## API 엔드포인트

### 인증
- `POST /auth/google` - Google OAuth 로그인
- `POST /auth/login` - 일반 로그인
- `GET /auth/profile` - 프로필 조회

### 티켓 & 그룹
- `GET /catalog-groups` - 그룹 목록
- `GET /catalog-groups/:id` - 그룹 상세
- `GET /catalog-items` - 티켓 목록
- `POST /catalog-items` - 티켓 생성 (Admin)

### Stub (수집)
- `POST /stubs` - 티켓 수집
- `DELETE /stubs/:id` - 티켓 수집 해제
- `GET /stubs/my` - 내 티켓 목록

### 컬렉션
- `GET /collections` - 컬렉션 목록
- `POST /collections` - 컬렉션 생성
- `GET /collections/:id` - 컬렉션 상세

### 소셜
- `POST /likes` - 좋아요
- `DELETE /likes/:id` - 좋아요 취소
- `POST /follows` - 팔로우
- `DELETE /follows/:id` - 언팔로우

### 알림
- `GET /notifications` - 알림 목록
- `PATCH /notifications/:id/read` - 읽음 처리

자세한 API 문서는 **[API 문서](.claude/guides/api-guide.md)** 참고.

## 레거시 프로젝트

이 프로젝트는 순수 HTML/CSS/JS로 작성된 [otbook 프로토타입](../otbook/)을 Next.js + NestJS 풀스택으로 마이그레이션한 것입니다.

**마이그레이션 이점:**
- ✅ 컴포넌트 재사용성 향상 (React)
- ✅ TypeScript 타입 안정성 (Frontend + Backend)
- ✅ 빌드 최적화 (Tree Shaking, Code Splitting)
- ✅ SSR/CSR 하이브리드 렌더링
- ✅ RESTful API 백엔드 (NestJS)
- ✅ 데이터베이스 (TypeORM + SQLite)
- ✅ 유지보수 용이성

---

## 기여

기여는 환영합니다! 다음 단계를 따라주세요:

1. 이 저장소를 Fork
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

---

## 라이선스

MIT License

---

## 문의

프로젝트에 대한 문의나 제안은 이슈를 통해 남겨주세요.

---

**Made with ❤️ using Next.js, TypeScript, and Tailwind CSS**
