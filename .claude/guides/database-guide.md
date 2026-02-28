# OTBOOK Database Guide

> NestJS + TypeORM + SQLite 데이터베이스 가이드

---

## 개요

OTBOOK 프로젝트는 티켓 컬렉션 앱을 위한 확장 가능한 데이터베이스 설계를 사용합니다.

**핵심 설계 원칙:**
- 티켓 수집에 집중 (행사 날짜/장소가 핵심 가치)
- 확장 가능한 구조 (향후 카드, 굿즈 등 추가 가능)
- catalog 네이밍 통일 (catalog_groups ↔ catalog_items)
- 메타데이터는 JSON으로 유연하게 관리
- 업적 시스템은 코드 기반 동적 관리

**기술 스택:**
- NestJS 11+ - TypeScript 백엔드 프레임워크
- TypeORM 0.3+ - ORM
- SQLite 3 - 개발 DB (프로덕션은 PostgreSQL 권장)
- EventEmitter - 이벤트 기반 업적 시스템

---

## 데이터베이스 구조

### 테이블 목록 (총 17개)

| 테이블 | 설명 | 관계 |
|--------|------|------|
| `users` | 사용자 | OAuth 지원, 프로필, role(USER/ADMIN) |
| `categories` | 카테고리 | 6개 기본 카테고리 (MUSIC, SPORTS, etc.) |
| `catalog_groups` | 카탈로그 그룹 | 관리자/사용자 생성 그룹 (계층 구조) |
| `catalog_items` | 카탈로그 아이템 | 티켓, 카드 등 수집품 |
| `catalog_item_metadata` | 아이템 메타데이터 | JSON 타입별 상세 정보 |
| `stubs` | 수집 티켓 | user가 수집한 catalog_item (collected/uncollected) |
| `likes` | 좋아요 | user ↔ catalog_item 매핑 |
| `follows` | 팔로우 | user ↔ user 매핑 (follower/following) |
| `collections` | 사용자 컬렉션 | 커스텀 컬렉션 (공개/비공개) |
| `collection_items` | 컬렉션 아이템 | collection ↔ catalog_item 매핑 |
| `collection_comments` | 컬렉션 댓글 | collection에 대한 댓글 |
| `collection_likes` | 컬렉션 좋아요 | user ↔ collection 좋아요 |
| `notifications` | 알림 | LIKE, FOLLOW, COMMENT, SYSTEM 알림 |
| `banners` | 배너 | 홈 화면 배너 (순서, 활성화) |
| `user_achievements` | 사용자 업적 | 업적 달성 기록 |
| `search_history` | 검색 이력 | 사용자별 검색 기록 |

---

## Entity 구조

### 1. User (사용자)

```typescript
// src/database/entities/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // 인증
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password_hash: string; // OAuth 사용자는 NULL

  // 프로필
  @Column({ unique: true })
  nickname: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar_url: string;

  // OAuth
  @Column({ nullable: true })
  oauth_provider: string; // 'google', 'kakao', 'naver'

  @Column({ nullable: true })
  oauth_id: string;

  // 온보딩 & 권한
  @Column({ default: false })
  onboarding_completed: boolean;

  @Column({ default: 'USER' })
  role: 'USER' | 'ADMIN';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**특징:**
- 이메일/비밀번호 + OAuth 소셜 로그인 지원
- nickname UNIQUE 제약으로 중복 방지
- UNIQUE(oauth_provider, oauth_id)로 OAuth 중복 방지
- role 필드로 USER/ADMIN 권한 구분
- onboarding_completed로 온보딩 완료 여부 추적

---

### 2. Category (카테고리)

```typescript
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // 'MUSIC', 'SPORTS', etc.

  @Column()
  name: string; // '음악', '스포츠'

  @Column()
  icon: string;

  @Column()
  color: string;
}
```

**기본 카테고리 (Seed 데이터):**
```sql
INSERT INTO categories (code, name, icon, color) VALUES
  ('MUSIC', '음악', 'music', 'purple'),
  ('SPORTS', '스포츠', 'sports', 'blue'),
  ('THEATER', '연극/뮤지컬', 'theater', 'red'),
  ('EXHIBITION', '전시', 'exhibition', 'green'),
  ('CINEMA', '영화', 'cinema', 'orange'),
  ('FESTIVAL', '페스티벌', 'festival', 'pink');
```

---

### 3. CatalogGroup (카탈로그 그룹)

```typescript
@Entity('catalog_groups')
export class CatalogGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  category_id: number;

  @Column()
  creator_id: number;

  @Column({ default: false })
  is_official: boolean; // 관리자 생성 여부

  @Column({ nullable: true })
  thumbnail_url: string; // 그룹 대표 이미지

  @Column({ default: 'published' })
  status: string; // 'draft', 'published', 'archived'

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  ticket_count: number; // 캐시
}
```

**사용 예시:**
- "서울 재즈 페스티벌 2020-2025" (공식 그룹, is_official=true)
- "내가 간 클래식 콘서트" (사용자 그룹, is_official=false)

---

### 4. CatalogItem (카탈로그 아이템)

```typescript
@Entity('catalog_items')
export class CatalogItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  category_id: number;

  @Column({ nullable: true })
  catalog_group_id: number; // NULL 허용

  @Column()
  owner_id: number;

  @Column({ default: 'collected' })
  status: string; // 'collected', 'wish', 'trading'

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: true })
  is_public: boolean;

  @Column({ default: 0 })
  like_count: number; // 캐시

  @Column({ default: 0 })
  view_count: number; // 캐시
}
```

**특징:**
- 공통 필드만 포함
- 타입별 상세 정보는 `catalog_item_metadata`로 분리

---

### 5. CatalogItemMetadata (메타데이터)

```typescript
@Entity('catalog_item_metadata')
export class CatalogItemMetadata {
  @PrimaryColumn()
  item_id: number;

  @Column('simple-json')
  metadata: {
    type: string;
    [key: string]: any;
  };
}
```

**메타데이터 JSON 스키마:**

**티켓 타입:**
```typescript
{
  type: 'ticket',
  event_date: '2025-05-15',
  venue: '올림픽공원',
  seat_info: 'A구역 12열 5번',
  section: 'VIP',
  price: 150000
}
```

**카드 타입 (향후):**
```typescript
{
  type: 'card',
  card_number: '025',
  series: 'Base Set',
  grade: 'PSA 10',
  rarity: 'legendary',
  hp: 60,
  card_type: 'Electric'
}
```

---

### 6. Stub (수집 티켓)

```typescript
@Entity('stubs')
export class Stub {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CatalogItem)
  @JoinColumn({ name: 'catalog_item_id' })
  catalog_item: CatalogItem;

  @Column({ nullable: true })
  image_url: string; // 사용자가 업로드한 실제 티켓 이미지

  @Column({ default: 'collected' })
  status: 'collected' | 'uncollected';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**특징:**
- 사용자가 실제로 수집한 티켓 기록
- catalog_item과는 별개로 사용자 소유 증명
- 실제 티켓 사진 업로드 가능 (image_url)

---

### 7. Banner (배너)

```typescript
@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  image_url: string;

  @Column({ nullable: true })
  link_url: string;

  @Column({ default: 0 })
  order_index: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
```

**특징:**
- 홈 화면 배너 관리
- order_index로 순서 조정
- is_active로 활성화/비활성화

---

### 8. Notification (알림)

```typescript
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  type: 'LIKE' | 'FOLLOW' | 'COMMENT' | 'SYSTEM';

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
```

**특징:**
- EventEmitter로 자동 생성 (좋아요, 팔로우 시)
- 4가지 타입: LIKE, FOLLOW, COMMENT, SYSTEM
- is_read로 읽음/안읽음 관리

---

### 9. Collection (컬렉션)

```typescript
@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  is_public: boolean;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  like_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**특징:**
- 사용자 커스텀 컬렉션
- 공개/비공개 설정 (is_public)
- 조회수, 좋아요 수 캐싱

---

### 10. CollectionComment (컬렉션 댓글)

```typescript
@Entity('collection_comments')
export class CollectionComment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Collection)
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  content: string;

  @CreateDateColumn()
  created_at: Date;
}
```

---

### 11. CollectionLike (컬렉션 좋아요)

```typescript
@Entity('collection_likes')
export class CollectionLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Collection)
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
```

---

### 12. UserAchievement (사용자 업적)

```typescript
@Entity('user_achievements')
export class UserAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  achievement_code: string; // 코드에 정의된 업적 키

  @CreateDateColumn()
  achieved_at: Date;
}
```

**업적 정의 (코드 기반):**
```typescript
// src/achievements/achievement.definitions.ts
export const ACHIEVEMENT_DEFINITIONS = {
  FIRST_TICKET: {
    code: 'first_ticket',
    name: '첫 티켓',
    description: '첫 번째 티켓을 수집했습니다',
    icon: 'star',
    check: (user, context) => context.userTicketCount >= 1
  },
  // ... 더 많은 업적
};
```

**특징:**
- achievements 테이블 없음 (코드로 관리)
- 이벤트 기반 자동 체크 (ticket.created, like.created 등)
- 배포만으로 업적 추가/수정 가능

---

## Migration & Seed

### Migration 실행

```bash
cd server

# Migration 실행
npm run typeorm migration:run

# Migration 되돌리기
npm run typeorm migration:revert
```

**생성된 Migration:**
1. `1709000000000-InitialSchema.ts` - 초기 스키마 생성
2. `1709000000001-SeedCategories.ts` - 카테고리 초기 데이터

---

## 사용 예시

### 1. 티켓 생성 (with 메타데이터)

```typescript
// 티켓 아이템 생성
const item = await catalogItemRepo.save({
  title: '서울재즈페스티벌 2025',
  category_id: 1, // MUSIC
  owner_id: userId,
  status: 'collected',
  image_url: 'https://example.com/ticket.jpg',
});

// 메타데이터 생성
await metadataRepo.save({
  item_id: item.id,
  metadata: {
    type: 'ticket',
    event_date: '2025-05-15',
    venue: '올림픽공원',
    seat_info: 'A-12',
    price: 150000,
  },
});

// 이벤트 발행 (업적 체크)
eventEmitter.emit('ticket.created', { userId });
```

---

### 2. 좋아요 추가

```typescript
// 좋아요 생성
const like = await likeRepo.save({
  user_id: userId,
  item_id: itemId,
});

// 좋아요 수 증가 (캐시 업데이트)
await catalogItemRepo.increment(
  { id: itemId },
  'like_count',
  1
);

// 이벤트 발행 (아이템 소유자의 업적 체크)
const item = await catalogItemRepo.findOne({ where: { id: itemId } });
eventEmitter.emit('like.created', { targetUserId: item.owner_id });
```

---

### 3. 사용자 업적 조회

```typescript
// AchievementService 사용
const achievements = await achievementService.getUserAchievements(userId);

// 결과:
[
  {
    code: 'first_ticket',
    name: '첫 티켓',
    description: '첫 번째 티켓을 수집했습니다',
    icon: 'star',
    achieved: true,
    achievedAt: '2025-03-01T10:00:00Z'
  },
  {
    code: 'collector_10',
    name: '컬렉터 입문',
    description: '10개의 티켓을 수집했습니다',
    icon: 'trophy',
    achieved: false,
    achievedAt: null
  }
]
```

---

### 4. 메타데이터로 티켓 검색

```typescript
// 특정 날짜의 티켓 검색
const items = await catalogItemRepo
  .createQueryBuilder('item')
  .innerJoinAndSelect('item.metadata', 'metadata')
  .where("json_extract(metadata.metadata, '$.event_date') = :date", {
    date: '2025-05-15',
  })
  .getMany();

// 특정 장소의 티켓 검색
const items = await catalogItemRepo
  .createQueryBuilder('item')
  .innerJoinAndSelect('item.metadata', 'metadata')
  .where("json_extract(metadata.metadata, '$.venue') LIKE :venue", {
    venue: '%올림픽공원%',
  })
  .getMany();
```

---

## API Endpoints

### Achievement API

```bash
# 전체 업적 목록
GET /achievements

# 사용자 업적 목록 (달성 여부 포함)
GET /achievements/users/:userId

# 사용자 업적 통계
GET /achievements/users/:userId/stats
```

**응답 예시 (stats):**
```json
{
  "total": 9,
  "unlocked": 3,
  "percentage": 33
}
```

---

## 인덱스 전략

```sql
-- 사용자 조회
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_nickname ON users(nickname);

-- 아이템 조회 (가장 빈번)
CREATE INDEX idx_catalog_items_owner ON catalog_items(owner_id);
CREATE INDEX idx_catalog_items_category ON catalog_items(category_id);
CREATE INDEX idx_catalog_items_status ON catalog_items(status);

-- 좋아요 조회
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_item ON likes(item_id);

-- 팔로우 조회
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

---

## 성능 최적화

### 1. 캐시 컬럼 사용

```typescript
// like_count, view_count는 캐시 컬럼
// 실시간 집계 대신 이벤트 발생시 증가

// 좋아요 추가시
await catalogItemRepo.increment({ id: itemId }, 'like_count', 1);

// 조회수 증가시
await catalogItemRepo.increment({ id: itemId }, 'view_count', 1);
```

### 2. Eager Loading

```typescript
// N+1 쿼리 방지
const items = await catalogItemRepo.find({
  relations: ['category', 'owner', 'metadata'],
});
```

---

## PostgreSQL 마이그레이션

프로덕션 환경에서 PostgreSQL로 전환:

```typescript
// data-source.ts
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // ...
});
```

**변경 사항:**
- JSON 타입 그대로 지원 (simple-json → json)
- AUTO_INCREMENT → SERIAL
- DATETIME → TIMESTAMP

---

## 트러블슈팅

### 1. Migration 오류

```bash
# Migration 실패시 수동으로 테이블 삭제
sqlite3 otbook.sqlite
> DROP TABLE IF EXISTS migrations;
> .quit

# 다시 실행
npm run typeorm migration:run
```

### 2. JSON 쿼리 (SQLite)

```typescript
// SQLite에서 JSON 추출
json_extract(metadata.metadata, '$.event_date')

// PostgreSQL에서 JSON 추출
metadata.metadata->>'event_date'
```

---

## 다음 단계

- **[frontend-guide.md](./frontend-guide.md)** - API 연동
- **[testing-guide.md](./testing-guide.md)** - 데이터베이스 테스트
- **[deployment-guide.md](./deployment-guide.md)** - 프로덕션 배포

---

**데이터베이스는 확장 가능하게 설계되었습니다!**
