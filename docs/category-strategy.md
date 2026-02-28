# 카테고리 전략 문서

> 최초 작성: 2026-02-28  
> 관련 마이그레이션: `1709000000011-RestructureCategories.ts`

---

## 1. 배경 및 목적

초기 invi는 오리지널 티켓(OGT) 수집에 특화된 구조로 시작했다.  
카테고리가 `MUSIC`, `SPORTS`, `THEATER`, `EXHIBITION`, `CINEMA`, `FESTIVAL` 6개로 flat하게 고정되어 있었고,  
확장성이 없어 드라마/영화 시청기록, 트레이딩 카드, 굿즈 등 새로운 수집 타입을 수용할 수 없었다.

이를 해결하기 위해 **item_type 기반의 다중 수집 타입 + 3단계 카테고리 계층 구조**로 재설계했다.

---

## 2. 핵심 개념

### 2-1. item_type (수집 타입)

아이템의 성격 자체를 구분하는 최상위 분류. 카테고리와 별개로 존재하며,  
동일한 item_type끼리 다른 카테고리를 가질 수 있다.

| item_type | 설명 | 예시 |
|---|---|---|
| `TICKET` | 실물 티켓 수집 | 메가박스 OGT, 공연 티켓, 경기 티켓 |
| `VIEWING` | 시청 기록 | 드라마 에피소드, 극장판 애니, 영화 |
| `TRADING_CARD` | 트레이딩 카드 수집 | 포켓몬 카드, 원피스 카드 |
| `GOODS` | 굿즈 수집 | 아이돌 굿즈, 애니메이션 굿즈 |

### 2-2. 카테고리 계층 (depth 0 → 1 → 2)

```
[depth 0] 대분류   - item_type 단위로 구분되는 큰 장르
[depth 1] 중분류   - 장르 내 세부 구분
[depth 2] 소분류   - 실제 CatalogGroup이 연결되는 최하위 카테고리
```

### 2-3. 전체 데이터 흐름

```
item_type
  └── Category (대분류, depth=0)
        └── Category (중분류, depth=1)
              └── Category (소분류, depth=2)
                    └── CatalogGroup  (컬렉션 묶음)
                          └── CatalogItem  (개별 아이템)
                                └── CatalogItemMetadata  (타입별 커스텀 필드)
```

---

## 3. 현재 카테고리 트리 (DB 기준)

### TICKET

```
영화 (MOVIE, id=7)
  ├── 극장 개봉 (THEATER_RELEASE, id=15)
  │     ├── 메가박스 오리지널 티켓 (MEGABOX_OGT, id=33)  ← CatalogGroup 연결
  │     └── CGV 아트하우스 (CGV_ART, id=34)
  └── OTT 독점 (OTT_MOVIE, id=16)

공연 (PERFORMANCE, id=8)
  ├── 음악공연 (MUSIC_CONCERT, id=17)
  ├── 뮤지컬/연극 (MUSICAL, id=18)
  └── 페스티벌 (FESTIVAL, id=19)

스포츠 (SPORTS, id=9)
  ├── 야구 (BASEBALL, id=20)
  ├── 축구 (SOCCER, id=21)
  └── 농구 (BASKETBALL, id=22)

전시 (EXHIBITION, id=10)
  └── 아트전시 (ART_EXHIBITION, id=23)
```

### VIEWING

```
드라마 (DRAMA, id=11)
  ├── 한국드라마 (KDRAMA, id=24)
  ├── 미국드라마 (US_DRAMA, id=25)
  └── 일본드라마 (JP_DRAMA, id=26)

애니메이션 (ANIME, id=12)
  ├── TV 애니메이션 (ANIME_TV, id=27)
  └── 극장판 애니메이션 (ANIME_MOVIE, id=28)
```

### TRADING_CARD

```
트레이딩 카드 (TRADING_CARD, id=13)
  ├── 포켓몬 (POKEMON, id=29)
  └── 원피스 카드 (ONEPIECE_CARD, id=30)
```

### GOODS

```
굿즈 (GOODS, id=14)
  ├── 아이돌 굿즈 (IDOL_GOODS, id=31)
  └── 애니메이션 굿즈 (ANIME_GOODS, id=32)
```

---

## 4. CatalogItem metadata 스키마 (item_type별)

`catalog_item_metadata.metadata` 컬럼은 `simple-json` 타입으로 타입별로 다른 필드를 수용한다.

### TICKET

```json
{
  "type": "TICKET",
  "variant": "투명지판",
  "numbering": "No.1",
  "seat": "A열 1번",
  "performance_date": "2024-03-15",
  "venue": "메가박스 코엑스"
}
```

### VIEWING

```json
{
  "type": "VIEWING",
  "episode": 1,
  "runtime": 60,
  "watched_at": "2024-03-15",
  "rating": 4.5,
  "platform": "Netflix",
  "rewatch_count": 0
}
```

### TRADING_CARD

```json
{
  "type": "TRADING_CARD",
  "card_number": "151/165",
  "rarity": "SAR",
  "set": "스칼렛 & 바이올렛 151",
  "grade": "PSA 10",
  "graded": true
}
```

### GOODS

```json
{
  "type": "GOODS",
  "goods_type": "포토카드",
  "artist": "BTS",
  "member": "RM",
  "edition": "초판",
  "release_date": "2024-01-01"
}
```

---

## 5. VIEWING 타입 특이사항

TICKET은 **실물 수집** 개념이지만, VIEWING은 **시청 경험 기록** 개념이다.  
따라서 CatalogItem의 단위가 다르다.

| 구분 | TICKET | VIEWING |
|---|---|---|
| CatalogGroup | OGT No.1 스파이더맨 | 오징어게임 |
| CatalogItem | 일반판 / 투명지판 / 스페셜판 | 시즌1 / 시즌2 또는 1화 / 2화 |
| metadata 핵심 필드 | variant, numbering, seat | episode, watched_at, rating, platform |
| status 의미 | collected / wish / trading | watched / watching / plan |

---

## 6. DB 테이블 변경 이력

### categories 테이블 추가 컬럼

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `depth` | INTEGER DEFAULT 0 | 0=대분류, 1=중분류, 2=소분류 |
| `parent_id` | INTEGER (FK) | 상위 카테고리 id, 대분류는 NULL |
| `item_type` | VARCHAR(30) | TICKET / VIEWING / TRADING_CARD / GOODS |
| `sort_order` | INTEGER DEFAULT 0 | 화면 노출 순서 |

### catalog_groups 테이블

- `parent_group_id` 컬럼 **제거** (역할이 카테고리 계층과 혼재되어 삭제)

### catalog_items 테이블 추가 컬럼

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `item_type` | VARCHAR(30) DEFAULT 'TICKET' | 아이템 수집 타입 |

---

## 7. 카테고리 확장 가이드

새로운 카테고리 추가 시 반드시 아래 순서로 진행한다.

1. **대분류가 없는 경우**: `depth=0`, `parent_id=NULL`, `item_type` 지정하여 INSERT
2. **중분류 추가**: `depth=1`, `parent_id=대분류id` 로 INSERT
3. **소분류 추가**: `depth=2`, `parent_id=중분류id` 로 INSERT → 이 id가 CatalogGroup의 `category_id`가 됨
4. **마이그레이션 파일 작성**: `server/src/database/migrations/` 에 timestamp 기반 파일명으로 추가
5. **item_type별 metadata 스키마** 문서(이 파일) 업데이트

### 새 item_type 추가 시

1. 이 문서에 item_type 정의 추가
2. 대분류 카테고리 추가 (위 순서 따라)
3. `catalog_items.item_type` ENUM에 추가 (현재 VARCHAR라 코드 레벨에서 관리)
4. metadata 스키마 정의 및 이 문서에 추가
5. 프론트 `CategoryFilter` 컴포넌트에 새 타입 반영

---

## 8. 관련 파일

```
server/src/database/entities/
  ├── category.entity.ts              # 카테고리 엔티티 (계층 구조 포함)
  ├── catalog-group.entity.ts         # 컬렉션 묶음
  ├── catalog-item.entity.ts          # 개별 아이템 (item_type 포함)
  └── catalog-item-metadata.entity.ts # 타입별 메타데이터

server/src/database/migrations/
  └── 1709000000011-RestructureCategories.ts  # 이 구조 적용한 마이그레이션

client-web/components/
  └── CategoryFilter.tsx              # 카테고리 필터 UI (계층 구조 반영 필요)
```
