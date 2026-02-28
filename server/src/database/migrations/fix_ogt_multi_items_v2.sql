-- OGT 다종 발행 누락 아이템 보정 SQL v2
-- sort_order가 OGT 번호 자체로 저장되어 있음 (예: No.17 → sort_order=17)
-- 추가 아이템은 sort_order를 {ogt_no}.2, {ogt_no}.3 로 구분하기 위해
-- REAL 타입 대신 별도 컬럼이 없으므로, sort_order에 소수점 활용
-- → 실제로는 INT이므로 sort_order = 기본값 유지하고 title로만 구분
-- 
-- 전략: 각 그룹에서 현재 1개뿐인 아이템의 정보를 복사해 추가 INSERT
-- 중복방지: catalog_group_id + title 조합으로 NOT EXISTS 체크

-- ============================================================
-- No.1 스파이더맨: 파 프롬 홈 (3종) → 2번째 추가 (3번째는 이미 있음)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.1 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 16 AND ci.title = 'OGT No.1 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 16 AND title = 'OGT No.1 티켓 (2번째)');

-- No.2 라이온 킹 (3종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.2 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 17 AND ci.title = 'OGT No.2 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 17 AND title = 'OGT No.2 티켓 (2번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.2 티켓 (3번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 17 AND ci.title = 'OGT No.2 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 17 AND title = 'OGT No.2 티켓 (3번째)');

-- No.4 타짜: 원 아이드 잭 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.4 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 19 AND ci.title = 'OGT No.4 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 19 AND title = 'OGT No.4 티켓 (2번째)');

-- No.5 원스 어폰 어 타임 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.5 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 20 AND ci.title = 'OGT No.5 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 20 AND title = 'OGT No.5 티켓 (2번째)');

-- No.8 날씨의 아이 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.8 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 23 AND ci.title = 'OGT No.8 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 23 AND title = 'OGT No.8 티켓 (2번째)');

-- No.9 겨울왕국 2 (3종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.9 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 24 AND ci.title = 'OGT No.9 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 24 AND title = 'OGT No.9 티켓 (2번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.9 티켓 (3번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 24 AND ci.title = 'OGT No.9 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 24 AND title = 'OGT No.9 티켓 (3번째)');

-- No.10 포드 V 페라리 (투명지 2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.10 투명지 (1번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 25 AND ci.title = 'OGT No.10 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 25 AND title = 'OGT No.10 투명지 (1번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.10 투명지 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 25 AND ci.title = 'OGT No.10 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 25 AND title = 'OGT No.10 투명지 (2번째)');

-- No.11 캣츠 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.11 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 26 AND ci.title = 'OGT No.11 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 26 AND title = 'OGT No.11 티켓 (2번째)');

-- No.12 스타워즈 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.12 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 27 AND ci.title = 'OGT No.12 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 27 AND title = 'OGT No.12 티켓 (2번째)');

-- No.14 버즈 오브 프레이 (2종+스티커)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.14 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 29 AND ci.title = 'OGT No.14 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 29 AND title = 'OGT No.14 티켓 (2번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.14 스티커', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 29 AND ci.title = 'OGT No.14 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 29 AND title = 'OGT No.14 스티커');

-- No.18 다만 악에서 구하소서 (2종+투명지 2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.18 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 33 AND ci.title = 'OGT No.18 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 33 AND title = 'OGT No.18 티켓 (2번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.18 투명지 (1번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 33 AND ci.title = 'OGT No.18 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 33 AND title = 'OGT No.18 투명지 (1번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.18 투명지 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 33 AND ci.title = 'OGT No.18 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 33 AND title = 'OGT No.18 투명지 (2번째)');

-- No.19 테넷 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.19 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 34 AND ci.title = 'OGT No.19 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 34 AND title = 'OGT No.19 티켓 (2번째)');

-- No.21 원더우먼 1984 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.21 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 36 AND ci.title = 'OGT No.21 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 36 AND title = 'OGT No.21 티켓 (2번째)');

-- No.23 톰과 제리 (2종+투명지 2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.23 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 38 AND ci.title = 'OGT No.23 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 38 AND title = 'OGT No.23 티켓 (2번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.23 투명지 (1번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 38 AND ci.title = 'OGT No.23 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 38 AND title = 'OGT No.23 투명지 (1번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.23 투명지 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 38 AND ci.title = 'OGT No.23 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 38 AND title = 'OGT No.23 투명지 (2번째)');

-- No.26 서복 (2종+투명지 2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.26 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 41 AND ci.title = 'OGT No.26 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 41 AND title = 'OGT No.26 티켓 (2번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.26 투명지 (1번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 41 AND ci.title = 'OGT No.26 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 41 AND title = 'OGT No.26 투명지 (1번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.26 투명지 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 41 AND ci.title = 'OGT No.26 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 41 AND title = 'OGT No.26 투명지 (2번째)');

-- No.27 분노의 질주 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.27 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 42 AND ci.title = 'OGT No.27 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 42 AND title = 'OGT No.27 티켓 (2번째)');

-- No.43 스파이더맨: 노 웨이 홈 (3종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.43 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 58 AND ci.title = 'OGT No.43 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 58 AND title = 'OGT No.43 티켓 (2번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.43 티켓 (3번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 58 AND ci.title = 'OGT No.43 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 58 AND title = 'OGT No.43 티켓 (3번째)');

-- No.48 더 배트맨 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.48 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 63 AND ci.title = 'OGT No.48 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 63 AND title = 'OGT No.48 티켓 (2번째)');

-- No.50 신비한 동물들과 덤블도어의 비밀 (3종) - HTML에서 2번째 이미지 URL 확인됨
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.50 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected',
  'https://i.namu.wiki/i/bOxO2VMOmPkvuLC0xUTahvqQCKoTeBd_ditheSO3Jq1ETHudkAjZlMaCAjwHvZ2t1t3BL2V1E4Tzjxx7Z_O-R9VfHerpnDyOiDohvGuPi8mdTEFleu303CjHmzVO8lfIACwDaoDBnmGamn_-M1oU3w.webp',
  'https://i.namu.wiki/i/bOxO2VMOmPkvuLC0xUTahvqQCKoTeBd_ditheSO3Jq1ETHudkAjZlMaCAjwHvZ2t1t3BL2V1E4Tzjxx7Z_O-R9VfHerpnDyOiDohvGuPi8mdTEFleu303CjHmzVO8lfIACwDaoDBnmGamn_-M1oU3w.webp',
  ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 65 AND ci.title = 'OGT No.50 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 65 AND title = 'OGT No.50 티켓 (2번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.50 티켓 (3번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 65 AND ci.title = 'OGT No.50 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 65 AND title = 'OGT No.50 티켓 (3번째)');

-- No.56 헤어질 결심 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.56 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 71 AND ci.title = 'OGT No.56 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 71 AND title = 'OGT No.56 티켓 (2번째)');

-- No.57 토르: 러브 앤 썬더 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.57 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 72 AND ci.title = 'OGT No.57 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 72 AND title = 'OGT No.57 티켓 (2번째)');

-- No.64 원피스 필름 레드 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.64 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 91 AND ci.title = 'OGT No.64 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 91 AND title = 'OGT No.64 티켓 (2번째)');

-- No.65 아바타: 물의 길 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.65 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 92 AND ci.title = 'OGT No.65 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 92 AND title = 'OGT No.65 티켓 (2번째)');

-- No.66 더 퍼스트 슬램덩크 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.66 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 93 AND ci.title = 'OGT No.66 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 93 AND title = 'OGT No.66 티켓 (2번째)');

-- No.76 드림 (커버 2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.76 커버 (1번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 103 AND ci.title = 'OGT No.76 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 103 AND title = 'OGT No.76 커버 (1번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.76 커버 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 103 AND ci.title = 'OGT No.76 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 103 AND title = 'OGT No.76 커버 (2번째)');

-- No.103 듄: 파트 2 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.103 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 130 AND ci.title = 'OGT No.103 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 130 AND title = 'OGT No.103 티켓 (2번째)');

-- No.115 탈주 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.115 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 142 AND ci.title = 'OGT No.115 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 142 AND title = 'OGT No.115 티켓 (2번째)');

-- No.121 룩 백 (2종+4컷 만화 용지)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.121 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 148 AND ci.title = 'OGT No.121 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 148 AND title = 'OGT No.121 티켓 (2번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.121 4컷 만화 용지', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 148 AND ci.title = 'OGT No.121 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 148 AND title = 'OGT No.121 4컷 만화 용지');

-- No.126 위키드 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.126 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 153 AND ci.title = 'OGT No.126 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 153 AND title = 'OGT No.126 티켓 (2번째)');

-- No.133 미키 17 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.133 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 160 AND ci.title = 'OGT No.133 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 160 AND title = 'OGT No.133 티켓 (2번째)');

-- No.136 기동전사 건담 (2종+케이스)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.136 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 163 AND ci.title = 'OGT No.136 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 163 AND title = 'OGT No.136 티켓 (2번째)');

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.136 케이스', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 163 AND ci.title = 'OGT No.136 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 163 AND title = 'OGT No.136 케이스');

-- No.141 드래곤 길들이기 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.141 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 168 AND ci.title = 'OGT No.141 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 168 AND title = 'OGT No.141 티켓 (2번째)');

-- No.147 얼굴 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.147 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 174 AND ci.title = 'OGT No.147 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 174 AND title = 'OGT No.147 티켓 (2번째)');

-- No.152 베이비걸 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.152 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 179 AND ci.title = 'OGT No.152 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 179 AND title = 'OGT No.152 티켓 (2번째)');

-- No.155 위키드: 포 굿 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.155 티켓 (2번째)', ci.description, ci.category_id, ci.catalog_group_id, ci.owner_id,
  'collected', ci.image_url, ci.image_url, ci.color, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 182 AND ci.title = 'OGT No.155 티켓'
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 182 AND title = 'OGT No.155 티켓 (2번째)');
