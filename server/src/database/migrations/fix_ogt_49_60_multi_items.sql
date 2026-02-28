-- ============================================================
-- OGT No.49~60 누락 아이템 수정 SQL
-- HTML 원본 데이터 기준으로 multi-item 그룹에 누락된 아이템 추가
--
-- 현황 (모두 items=1 상태):
--   No.49 모비우스         → 1종 ✅ (추가 불필요)
--   No.50 신비한 동물들    → 3종 ❌ (2개 추가 필요)
--   No.51 닥터 스트레인지  → 1종+투명지 1종 ❌ (1개 추가 필요)
--   No.52 범죄도시 2       → 1종 ✅
--   No.53 쥬라기 월드      → 1종 ✅
--   No.54 버즈 라이트이어  → 1종+스티커 1종 ❌ (1개 추가 필요)
--   No.55 탑건: 매버릭     → 1종 ✅
--   No.56 헤어질 결심      → 2종 ❌ (1개 추가 필요)
--   No.57 토르             → 2종 ❌ (1개 추가 필요)
--   No.58 미니언즈 2       → 1종 ✅
--   No.59 비상선언         → 1종+스티커 1종 ❌ (1개 추가 필요)
--   No.60 헌트             → 1종+커버 1종 ❌ (1개 추가 필요)
-- ============================================================

-- ----------------------------------------
-- No.50 신비한 동물들과 덤블도어의 비밀 (3종)
-- group_id=65, 기존 item_id=75
-- 이미지: OGT50-1, OGT50-2, OGT50-3(기존)
-- ----------------------------------------

-- 2번째 티켓 (OGT50-1 이미지)
INSERT INTO catalog_items (
    title, description, category_id, catalog_group_id, owner_id,
    status, image_url, thumbnail_url, color, icon, is_public,
    like_count, view_count, sort_order, created_at, updated_at
)
SELECT
    'OGT No.50 티켓 (2번째)',
    '2022. 4. 13. 발행',
    ci.category_id,
    ci.catalog_group_id,
    ci.owner_id,
    'collected',
    'https://i.namu.wiki/i/Ylovmx5wS6ZFrOLPTPNfSd2pDskR2PIINUyJ4cB_IFpTGUa-t8xGEYg9HlUwhvodvQ7oJvLuoIJiaGlWEzYnO7ol-kpjEbqLDuqePOZv6mBnhOteCXctLz-qYcDR4lFPlQkHvfYAfFIolmfnKoy9Pw.webp',
    'https://i.namu.wiki/i/Ylovmx5wS6ZFrOLPTPNfSd2pDskR2PIINUyJ4cB_IFpTGUa-t8xGEYg9HlUwhvodvQ7oJvLuoIJiaGlWEzYnO7ol-kpjEbqLDuqePOZv6mBnhOteCXctLz-qYcDR4lFPlQkHvfYAfFIolmfnKoy9Pw.webp',
    ci.color,
    ci.icon,
    1, 0, 0,
    ci.sort_order,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci
WHERE ci.id = 75
AND NOT EXISTS (
    SELECT 1 FROM catalog_items WHERE catalog_group_id = 65 AND title = 'OGT No.50 티켓 (2번째)'
);

-- 3번째 티켓 (OGT50-2 이미지)
INSERT INTO catalog_items (
    title, description, category_id, catalog_group_id, owner_id,
    status, image_url, thumbnail_url, color, icon, is_public,
    like_count, view_count, sort_order, created_at, updated_at
)
SELECT
    'OGT No.50 티켓 (3번째)',
    '2022. 4. 13. 발행',
    ci.category_id,
    ci.catalog_group_id,
    ci.owner_id,
    'collected',
    'https://i.namu.wiki/i/bOxO2VMOmPkvuLC0xUTahvqQCKoTeBd_ditheSO3Jq1ETHudkAjZlMaCAjwHvZ2t1t3BL2V1E4Tzjxx7Z_O-R9VfHerpnDyOiDohvGuPi8mdTEFleu303CjHmzVO8lfIACwDaoDBnmGamn_-M1oU3w.webp',
    'https://i.namu.wiki/i/bOxO2VMOmPkvuLC0xUTahvqQCKoTeBd_ditheSO3Jq1ETHudkAjZlMaCAjwHvZ2t1t3BL2V1E4Tzjxx7Z_O-R9VfHerpnDyOiDohvGuPi8mdTEFleu303CjHmzVO8lfIACwDaoDBnmGamn_-M1oU3w.webp',
    ci.color,
    ci.icon,
    1, 0, 0,
    ci.sort_order,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci
WHERE ci.id = 75
AND NOT EXISTS (
    SELECT 1 FROM catalog_items WHERE catalog_group_id = 65 AND title = 'OGT No.50 티켓 (3번째)'
);

-- 기존 No.50 아이템 title을 '1번째'로 업데이트
UPDATE catalog_items
SET title = 'OGT No.50 티켓 (1번째)', updated_at = CURRENT_TIMESTAMP
WHERE id = 75 AND title = 'OGT No.50 티켓';

-- ----------------------------------------
-- No.51 닥터 스트레인지: 대혼돈의 멀티버스 (1종+투명지 1종)
-- group_id=66, 기존 item_id=76
-- ----------------------------------------

INSERT INTO catalog_items (
    title, description, category_id, catalog_group_id, owner_id,
    status, image_url, thumbnail_url, color, icon, is_public,
    like_count, view_count, sort_order, created_at, updated_at
)
SELECT
    'OGT No.51 투명지',
    '2022. 5. 11. 발행',
    ci.category_id,
    ci.catalog_group_id,
    ci.owner_id,
    'collected',
    ci.image_url,
    ci.thumbnail_url,
    ci.color,
    ci.icon,
    1, 0, 0,
    ci.sort_order,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci
WHERE ci.id = 76
AND NOT EXISTS (
    SELECT 1 FROM catalog_items WHERE catalog_group_id = 66 AND title = 'OGT No.51 투명지'
);

-- ----------------------------------------
-- No.54 버즈 라이트이어 (1종+스티커 1종)
-- group_id=69, 기존 item_id=79
-- ----------------------------------------

INSERT INTO catalog_items (
    title, description, category_id, catalog_group_id, owner_id,
    status, image_url, thumbnail_url, color, icon, is_public,
    like_count, view_count, sort_order, created_at, updated_at
)
SELECT
    'OGT No.54 스티커',
    '2022. 6. 15. 발행',
    ci.category_id,
    ci.catalog_group_id,
    ci.owner_id,
    'collected',
    ci.image_url,
    ci.thumbnail_url,
    ci.color,
    ci.icon,
    1, 0, 0,
    ci.sort_order,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci
WHERE ci.id = 79
AND NOT EXISTS (
    SELECT 1 FROM catalog_items WHERE catalog_group_id = 69 AND title = 'OGT No.54 스티커'
);

-- ----------------------------------------
-- No.56 헤어질 결심 (2종)
-- group_id=71, 기존 item_id=81
-- ----------------------------------------

INSERT INTO catalog_items (
    title, description, category_id, catalog_group_id, owner_id,
    status, image_url, thumbnail_url, color, icon, is_public,
    like_count, view_count, sort_order, created_at, updated_at
)
SELECT
    'OGT No.56 티켓 (2번째)',
    '2022. 6. 29. 발행',
    ci.category_id,
    ci.catalog_group_id,
    ci.owner_id,
    'collected',
    ci.image_url,
    ci.thumbnail_url,
    ci.color,
    ci.icon,
    1, 0, 0,
    ci.sort_order,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci
WHERE ci.id = 81
AND NOT EXISTS (
    SELECT 1 FROM catalog_items WHERE catalog_group_id = 71 AND title = 'OGT No.56 티켓 (2번째)'
);

-- 기존 title 업데이트
UPDATE catalog_items
SET title = 'OGT No.56 티켓 (1번째)', updated_at = CURRENT_TIMESTAMP
WHERE id = 81 AND title = 'OGT No.56 티켓';

-- ----------------------------------------
-- No.57 토르: 러브 앤 썬더 (2종)
-- group_id=72, 기존 item_id=82
-- ----------------------------------------

INSERT INTO catalog_items (
    title, description, category_id, catalog_group_id, owner_id,
    status, image_url, thumbnail_url, color, icon, is_public,
    like_count, view_count, sort_order, created_at, updated_at
)
SELECT
    'OGT No.57 티켓 (2번째)',
    '2022. 7. 13. 발행',
    ci.category_id,
    ci.catalog_group_id,
    ci.owner_id,
    'collected',
    ci.image_url,
    ci.thumbnail_url,
    ci.color,
    ci.icon,
    1, 0, 0,
    ci.sort_order,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci
WHERE ci.id = 82
AND NOT EXISTS (
    SELECT 1 FROM catalog_items WHERE catalog_group_id = 72 AND title = 'OGT No.57 티켓 (2번째)'
);

-- 기존 title 업데이트
UPDATE catalog_items
SET title = 'OGT No.57 티켓 (1번째)', updated_at = CURRENT_TIMESTAMP
WHERE id = 82 AND title = 'OGT No.57 티켓';

-- ----------------------------------------
-- No.59 비상선언 (1종+스티커 1종)
-- group_id=74, 기존 item_id=84
-- ----------------------------------------

INSERT INTO catalog_items (
    title, description, category_id, catalog_group_id, owner_id,
    status, image_url, thumbnail_url, color, icon, is_public,
    like_count, view_count, sort_order, created_at, updated_at
)
SELECT
    'OGT No.59 스티커',
    '2022. 8. 3. 발행',
    ci.category_id,
    ci.catalog_group_id,
    ci.owner_id,
    'collected',
    ci.image_url,
    ci.thumbnail_url,
    ci.color,
    ci.icon,
    1, 0, 0,
    ci.sort_order,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci
WHERE ci.id = 84
AND NOT EXISTS (
    SELECT 1 FROM catalog_items WHERE catalog_group_id = 74 AND title = 'OGT No.59 스티커'
);

-- ----------------------------------------
-- No.60 헌트 (1종+커버 1종)
-- group_id=75, 기존 item_id=85
-- ----------------------------------------

INSERT INTO catalog_items (
    title, description, category_id, catalog_group_id, owner_id,
    status, image_url, thumbnail_url, color, icon, is_public,
    like_count, view_count, sort_order, created_at, updated_at
)
SELECT
    'OGT No.60 커버',
    '2022. 8. 10. 발행',
    ci.category_id,
    ci.catalog_group_id,
    ci.owner_id,
    'collected',
    ci.image_url,
    ci.thumbnail_url,
    ci.color,
    ci.icon,
    1, 0, 0,
    ci.sort_order,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci
WHERE ci.id = 85
AND NOT EXISTS (
    SELECT 1 FROM catalog_items WHERE catalog_group_id = 75 AND title = 'OGT No.60 커버'
);

-- ============================================================
-- 검증 쿼리
-- ============================================================
SELECT ci_agg.sort_order AS 'No.', ci_agg.item_count AS '아이템 수', ci_agg.titles AS '아이템 목록'
FROM (
    SELECT ci.sort_order, COUNT(ci.id) AS item_count, GROUP_CONCAT(ci.title, ' / ') AS titles
    FROM catalog_items ci
    WHERE ci.sort_order BETWEEN 49 AND 60
    GROUP BY ci.catalog_group_id
    ORDER BY ci.sort_order
) ci_agg;
