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
- 📸 티켓 디지털 보관 및 관리
- 🎨 카테고리별 티켓 컬렉션
- 🔍 강력한 검색 및 필터링
- 👥 컬렉터 커뮤니티
- 📊 수집 통계 및 업적 시스템

**참고 레퍼런스**: [icu.gg/card/list](https://icu.gg/card/list) (카드 컬렉션 커뮤니티)

---

## 기술 스택

### Frontend
- **Next.js 15+** - React 프레임워크 (App Router)
- **TypeScript 5+** - 타입 안정성
- **Tailwind CSS 3.4+** - 유틸리티 기반 스타일링
- **React 19+** - UI 라이브러리

### Backend
- **NestJS 11+** - TypeScript 기반 백엔드
- **TypeORM 0.3+** - ORM
- **SQLite 3** - 개발 DB (→ PostgreSQL 프로덕션)
- **EventEmitter** - 이벤트 기반 업적 시스템

### Infrastructure
- **nginx** - 웹 서버
- **Static Export** - 정적 파일 배포

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

### 4. 빌드

```bash
# Client-Web 빌드
cd client-web
npm run build
# → out/ 폴더에 정적 파일 생성

# Admin 빌드
cd admin
npm run build
# → out/ 폴더에 정적 파일 생성
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
│   │   ├── database/           # TypeORM 설정
│   │   │   ├── entities/       # Entity 파일 (11개)
│   │   │   ├── migrations/     # Migration 파일
│   │   │   └── data-source.ts  # DataSource 설정
│   │   ├── achievements/       # 업적 시스템
│   │   │   ├── achievement.definitions.ts
│   │   │   ├── achievement.service.ts
│   │   │   └── achievement.module.ts
│   │   └── main.ts             # 진입점
│   └── otbook.sqlite           # SQLite 데이터베이스
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

| 페이지 | 경로 | 설명 |
|-------|------|------|
| 홈 | `/` | 배너, 추천 컬렉션, 인기 티켓 |
| 검색 | `/search` | 티켓 검색, 카테고리 탐색 |
| 카탈로그 | `/catalog` | 그룹별 티켓 컬렉션 |
| 카탈로그 상세 | `/catalog/[id]` | 그룹 티켓 상세 (2×2 페이저) |
| 마이 페이지 | `/my` | 내 티켓, 업적, 설정 |
| 관리자 | `/admin` | 대시보드, 관리 기능 |

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

### Static Export 방식

```bash
# 1. 빌드
cd client-web && npm run build
cd admin && npm run build

# 2. 배포 (nginx)
cp -r client-web/out/* /home/gurwls2399/client/
cp -r admin/out/* /home/gurwls2399/admin/

# 3. nginx 재시작
sudo systemctl reload nginx
```

자세한 내용은 **[배포 가이드](.claude/guides/deployment-guide.md)**를 참고하세요.

---

## 로드맵

### ✅ Phase 1 - 프로젝트 구조 (완료)
- [x] Next.js 프로젝트 초기화
- [x] TypeScript + Tailwind CSS 설정
- [x] Static Export 설정
- [x] 디자인 시스템 적용

### 🚧 Phase 2 - Frontend 개발 (진행 중)
- [ ] otbook 페이지 Next.js 포팅
- [ ] 공통 컴포넌트 라이브러리
- [ ] Mock 데이터 TypeScript 변환
- [ ] Admin 페이지 개발

### ✅ Phase 3 - Backend API (완료)
- [x] NestJS 프로젝트 초기화
- [x] TypeORM + SQLite 설정
- [x] Entity 파일 생성 (11개 테이블)
- [x] Migration & Seed 데이터
- [x] Achievement 시스템 구현 (이벤트 기반)
- [ ] RESTful API 구현 (진행 예정)
- [ ] Frontend-Backend 연동 (진행 예정)

### 📅 Phase 4 - 배포 및 최적화 (계획)
- [ ] 프로덕션 배포
- [ ] 이미지 최적화
- [ ] SEO 최적화
- [ ] 성능 모니터링

---

## 레거시 프로젝트

이 프로젝트는 순수 HTML/CSS/JS로 작성된 [otbook 프로토타입](../otbook/)을 Next.js로 마이그레이션한 것입니다.

**마이그레이션 이점:**
- ✅ 컴포넌트 재사용성 향상
- ✅ TypeScript 타입 안정성
- ✅ 빌드 최적화 (Tree Shaking, Code Splitting)
- ✅ SEO 최적화 (Static Export)
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
