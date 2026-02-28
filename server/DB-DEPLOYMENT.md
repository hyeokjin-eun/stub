# OTBOOK 데이터베이스 배포 가이드

## 📦 배포 파일 구조

```
server/
├── src/database/
│   ├── migrations/
│   │   └── 1740700000000-InitialSetup.ts    # 스키마 마이그레이션
│   └── seed-data.sql                          # 시드 데이터 (categories, groups, items)
├── deploy-db.sh                               # 배포 스크립트
└── otbook.sqlite                              # 현재 DB 파일
```

## 🚀 새 환경에 배포하기

### 방법 1: 배포 스크립트 사용 (권장)

가장 간단한 방법입니다. 마이그레이션과 시드 데이터를 자동으로 적용합니다.

```bash
cd server
npm run db:deploy
```

이 스크립트는 다음을 수행합니다:
1. 기존 DB 백업 (`backups/` 폴더)
2. TypeORM 마이그레이션 실행 (테이블 생성)
3. 시드 데이터 적용 (categories, groups, items 등)
4. DB 상태 확인

### 방법 2: 단계별 수동 배포

```bash
# 1. 마이그레이션 실행 (테이블 생성)
npm run migration:run

# 2. 시드 데이터 적용
npm run db:seed

# 3. 확인
sqlite3 otbook.sqlite "SELECT COUNT(*) FROM categories"
```

### 방법 3: 기존 DB 파일 복사 (가장 빠름)

현재 작동 중인 DB를 그대로 복사하는 방법입니다.

```bash
# 현재 서버에서
scp otbook.sqlite user@new-server:/path/to/server/

# 새 서버에서
cd /path/to/server
npm run start:prod
```

## 📊 포함된 데이터

`seed-data.sql`에는 다음 데이터가 포함되어 있습니다:

- **System User** (1개) - `system@otbook.app` (카탈로그 생성용)
- **Categories** (49개) - 전체 카테고리 계층 구조
- **Category UI Configs** (7개) - 카테고리 UI 설정
- **Item Type UI Configs** (2개) - TICKET, VIEWING 설정
- **Catalog Groups** (~300개) - 넷플릭스, OGT 등 모든 그룹
- **Catalog Items** (~300개) - 모든 티켓/시청 기록
- **App Settings** - 앱 기본 설정

사용자 활동 데이터는 **포함되지 않습니다**:
- users (system 제외)
- stubs (수집 티켓)
- likes (찜)
- collections (컬렉션)
- follows (팔로우)
- notifications (알림)

## 🔄 마이그레이션 관리

### 새로운 마이그레이션 생성

스키마 변경이 필요한 경우:

```bash
# 마이그레이션 파일 생성
npm run typeorm migration:create -- src/database/migrations/NewFeature

# 마이그레이션 실행
npm run migration:run

# 롤백
npm run migration:revert
```

### 시드 데이터 업데이트

카탈로그 데이터를 추가/변경한 경우, 현재 DB를 다시 export:

```bash
# 1. 현재 DB에서 시드 데이터 추출
sqlite3 otbook.sqlite << 'EOF' > src/database/seed-data.sql
.mode insert users
SELECT * FROM users WHERE email = 'system@otbook.app';

.mode insert categories
SELECT * FROM categories ORDER BY id;

.mode insert catalog_groups
SELECT * FROM catalog_groups ORDER BY id;

.mode insert catalog_items
SELECT * FROM catalog_items ORDER BY id;
EOF

# 2. Git에 커밋
git add src/database/seed-data.sql
git commit -m "chore: update seed data"
```

## 🧪 테스트 환경 구축

개발용 테스트 DB를 만들려면:

```bash
# 1. 기존 DB 백업
mv otbook.sqlite otbook.backup.sqlite

# 2. 새 DB 생성
npm run db:deploy

# 3. 테스트 사용자 추가 (선택)
sqlite3 otbook.sqlite << 'SQL'
INSERT INTO users (email, nickname, onboarding_completed, role)
VALUES ('test@example.com', 'TestUser', 1, 'USER');
SQL
```

## 🔧 문제 해결

### "database is locked" 에러

서버를 먼저 종료하세요:

```bash
pkill -f "nest start"
npm run db:deploy
```

### 마이그레이션이 실행되지 않음

```bash
# 마이그레이션 테이블 확인
sqlite3 otbook.sqlite "SELECT * FROM migrations"

# 마이그레이션 테이블 초기화 (주의!)
sqlite3 otbook.sqlite "DELETE FROM migrations"
npm run migration:run
```

### 시드 데이터 중복 에러

기존 데이터를 먼저 삭제:

```bash
sqlite3 otbook.sqlite << 'SQL'
DELETE FROM catalog_items;
DELETE FROM catalog_groups;
DELETE FROM categories WHERE id > 6;
SQL

npm run db:seed
```

## 📝 배포 체크리스트

새 서버에 배포할 때 확인사항:

- [ ] Node.js 24+ 설치
- [ ] npm dependencies 설치 (`npm install`)
- [ ] 환경 변수 설정 (`.env`)
- [ ] DB 배포 (`npm run db:deploy`)
- [ ] DB 상태 확인 (categories, groups, items 개수)
- [ ] 서버 시작 (`npm run start:prod`)
- [ ] API 테스트 (`curl http://localhost:3002/categories/roots`)

## 🔐 프로덕션 주의사항

1. **백업 자동화**: 매일 자동 백업 설정
2. **권한 관리**: DB 파일 권한 제한 (`chmod 600 otbook.sqlite`)
3. **시드 데이터 검토**: 민감한 정보 제거 확인
4. **마이그레이션 테스트**: 프로덕션 적용 전 스테이징에서 테스트

---

**작성일**: 2026-02-28
**버전**: 1.0
