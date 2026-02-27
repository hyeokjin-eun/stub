# OTBOOK - 프로젝트 정보

> **Last Updated:** 2026-02-27 | **Version:** 2.0.0

## 프로젝트 개요

OTBOOK은 수집가들이 자신이 소장한 오리지널 티켓(콘서트, 스포츠, 뮤지컬, 전시 등)을 디지털로 보관하고 다른 컬렉터들과 공유하는 모바일 웹 애플리케이션입니다.

**참고 레퍼런스**: https://icu.gg/card/list (카드 컬렉션 커뮤니티)

## 기술 스택

### Frontend (Client & Admin)
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3.4+
- **Build**: Static Export
- **Runtime**: React 19+

### Backend (향후 개발 예정)
- **Framework**: NestJS (TypeScript)
- **Database**: SQLite (프로토타입 단계)
- **Future**: PostgreSQL 마이그레이션 고려

### Infrastructure
- **Web Server**: nginx
- **Port**: 80
- **Deployment**: Static file deployment (otbook 방식과 동일)

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
├── server/                     # 백엔드 (향후 개발)
│   └── (NestJS 프로젝트)
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

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Client-Web (Dev) | 3000 | 고객용 Next.js 개발 서버 |
| Admin (Dev) | 3001 | 어드민 Next.js 개발 서버 |
| Backend (Future) | 8000 | NestJS API 서버 |
| Production | 80 | nginx 프로덕션 서버 |

## 배포 방식

### Static Export (현재)
```bash
# Client-Web 빌드
cd client-web
npm run build
# → out/ 폴더에 정적 파일 생성

# Admin 빌드
cd admin
npm run build
# → out/ 폴더에 정적 파일 생성

# nginx에 배포
cp -r client-web/out/* /home/gurwls2399/client/
cp -r admin/out/* /home/gurwls2399/admin/
```

## 레거시 참조

이 프로젝트는 순수 HTML/CSS/JS로 작성된 [otbook 프로토타입](../otbook/)을 Next.js로 마이그레이션한 것입니다.

- 기존 디자인 시스템과 컴포넌트 유지
- React 컴포넌트로 재구성하여 재사용성 향상
- TypeScript 도입으로 타입 안정성 확보
- Static Export로 기존 배포 방식 유지

## 로드맵

### Phase 1 - 프로젝트 구조 설정 ✅
- [x] Next.js 프로젝트 초기화 (client-web, admin)
- [x] TypeScript + Tailwind CSS 설정
- [x] Static Export 설정
- [x] 디자인 시스템 적용

### Phase 2 - Frontend 개발 (진행 중)
- [ ] otbook 페이지들 Next.js로 포팅
  - [ ] 홈 (index.html → app/page.tsx)
  - [ ] 검색 (search.html → app/search/page.tsx)
  - [ ] 카탈로그 (catalog.html → app/catalog/page.tsx)
  - [ ] 카탈로그 상세 (catalog-detail.html → app/catalog/[id]/page.tsx)
  - [ ] 마이 페이지 (my.html → app/my/page.tsx)
- [ ] 공통 컴포넌트 작성
  - [ ] TicketCard (tg-card)
  - [ ] GroupCard
  - [ ] BottomNav
  - [ ] Header
  - [ ] Modal
- [ ] Admin 페이지 개발
  - [ ] 대시보드
  - [ ] 티켓 관리
  - [ ] 그룹 관리
  - [ ] 사용자 관리

### Phase 3 - Backend API (계획됨)
- [ ] NestJS 프로젝트 초기화
- [ ] SQLite 설정
- [ ] RESTful API 구현
  - [ ] 티켓 CRUD
  - [ ] 그룹 CRUD
  - [ ] 사용자 인증
  - [ ] 검색 API
- [ ] Frontend-Backend 연동

### Phase 4 - 배포 및 최적화 (계획됨)
- [ ] nginx 설정
- [ ] 이미지 최적화
- [ ] SEO 최적화
- [ ] 성능 모니터링
- [ ] PWA 설정 (선택)

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
