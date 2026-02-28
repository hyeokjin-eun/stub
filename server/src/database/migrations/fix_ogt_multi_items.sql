-- OGT 다종 발행 누락 아이템 INSERT/UPDATE 보정 SQL
-- 각 그룹에 기본 1종은 이미 들어가 있음
-- 2종/3종 그룹의 추가 아이템을 INSERT, 이미 존재하면 SKIP (INSERT OR IGNORE)
-- 
-- catalog_items UNIQUE 제약이 없으므로 중복 방지를 위해
-- 먼저 이미 2종 이상 있는지 COUNT로 체크 후 없을 때만 INSERT

-- ============================================================
-- [전제] catalog_groups id 정보
-- (16) OGT No.1  스파이더맨: 파 프롬 홈  | 3종
-- (17) OGT No.2  라이온 킹               | 3종
-- (19) OGT No.4  타짜: 원 아이드 잭       | 2종
-- (20) OGT No.5  원스 어폰 어 타임        | 2종
-- (23) OGT No.8  날씨의 아이              | 2종
-- (24) OGT No.9  겨울왕국 2              | 3종
-- (25) OGT No.10 포드 V 페라리           | 3종(투명지 포함)
-- (26) OGT No.11 캣츠                    | 2종
-- (27) OGT No.12 스타워즈                | 2종
-- (29) OGT No.14 버즈 오브 프레이        | 3종(스티커 포함)
-- (33) OGT No.18 다만 악에서 구하소서    | 4종(투명지 포함)
-- (34) OGT No.19 테넷                    | 2종
-- (36) OGT No.21 원더우먼 1984          | 2종
-- (38) OGT No.23 톰과 제리              | 4종(투명지 포함)
-- (41) OGT No.26 서복                   | 4종(투명지 포함)
-- (42) OGT No.27 분노의 질주            | 2종
-- (58) OGT No.43 스파이더맨: 노 웨이 홈 | 3종
-- (63) OGT No.48 더 배트맨              | 2종
-- (65) OGT No.50 신비한 동물들          | 3종
-- (71) OGT No.56 헤어질 결심           | 2종
-- (72) OGT No.57 토르: 러브 앤 썬더    | 2종
-- (91) OGT No.64 원피스 필름 레드      | 2종
-- (92) OGT No.65 아바타: 물의 길       | 2종
-- (93) OGT No.66 더 퍼스트 슬램덩크   | 2종
-- (103) OGT No.76 드림                 | 3종(커버 포함)
-- (130) OGT No.103 듄: 파트 2          | 2종
-- (142) OGT No.115 탈주                | 2종
-- (148) OGT No.121 룩 백               | 3종(4컷 만화 용지 포함)
-- (153) OGT No.126 위키드              | 2종
-- (160) OGT No.133 미키 17             | 2종
-- (163) OGT No.136 기동전사 건담       | 3종(케이스 포함)
-- (168) OGT No.141 드래곤 길들이기    | 2종
-- (174) OGT No.147 얼굴               | 2종
-- (179) OGT No.152 베이비걸           | 2종
-- (182) OGT No.155 위키드: 포 굿      | 2종
-- ============================================================

-- 헬퍼: 아이템 중복 삽입 방지를 위해 sort_order로 구분
-- sort_order 1 = 이미 존재, 2 이상 = 추가 아이템

-- No.1 스파이더맨: 파 프롬 홈 (3종) → 2번째, 3번째 추가
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.1 티켓 (2번째)', '2019. 7. 4. 발행', ci.category_id, 16, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 16 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 16 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.1 티켓 (3번째)', '2019. 7. 4. 발행', ci.category_id, 16, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 16 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 16 AND sort_order = 3);

-- No.2 라이온 킹 (3종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.2 티켓 (2번째)', '2019. 7. 19. 발행', ci.category_id, 17, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 17 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 17 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.2 티켓 (3번째)', '2019. 7. 19. 발행', ci.category_id, 17, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 17 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 17 AND sort_order = 3);

-- No.4 타짜: 원 아이드 잭 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.4 티켓 (2번째)', '2019. 9. 11. 발행', ci.category_id, 19, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 19 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 19 AND sort_order = 2);

-- No.5 원스 어폰 어 타임... 인 할리우드 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.5 티켓 (2번째)', '2019. 9. 25. 발행', ci.category_id, 20, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 20 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 20 AND sort_order = 2);

-- No.8 날씨의 아이 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.8 티켓 (2번째)', '2019. 10. 30. 발행', ci.category_id, 23, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 23 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 23 AND sort_order = 2);

-- No.9 겨울왕국 2 (3종 + 스페셜 클립 1종 → 실물 티켓 3종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.9 티켓 (2번째)', '2019. 11. 21. 발행', ci.category_id, 24, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 24 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 24 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.9 티켓 (3번째)', '2019. 11. 21. 발행', ci.category_id, 24, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 24 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 24 AND sort_order = 3);

-- No.10 포드 V 페라리 (1종+투명지 2종 → 투명지 2종 추가)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.10 투명지 (1번째)', '2019. 12. 4. 발행', ci.category_id, 25, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 25 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 25 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.10 투명지 (2번째)', '2019. 12. 4. 발행', ci.category_id, 25, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 25 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 25 AND sort_order = 3);

-- No.11 캣츠 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.11 티켓 (2번째)', '2019. 12. 24. 발행', ci.category_id, 26, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 26 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 26 AND sort_order = 2);

-- No.12 스타워즈: 라이즈 오브 스카이워커 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.12 티켓 (2번째)', '2020. 1. 8. 발행', ci.category_id, 27, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 27 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 27 AND sort_order = 2);

-- No.14 버즈 오브 프레이 (2종+스티커 1종 → 티켓 2번째 + 스티커)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.14 티켓 (2번째)', '2020. 2. 5. 발행', ci.category_id, 29, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 29 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 29 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.14 스티커', '2020. 2. 5. 발행', ci.category_id, 29, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 29 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 29 AND sort_order = 3);

-- No.18 다만 악에서 구하소서 (2종+투명지 2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.18 티켓 (2번째)', '2020. 8. 5. 발행', ci.category_id, 33, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 33 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 33 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.18 투명지 (1번째)', '2020. 8. 5. 발행', ci.category_id, 33, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 33 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 33 AND sort_order = 3);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.18 투명지 (2번째)', '2020. 8. 5. 발행', ci.category_id, 33, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 33 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 33 AND sort_order = 4);

-- No.19 테넷 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.19 티켓 (2번째)', '2020. 8. 26. 발행', ci.category_id, 34, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 34 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 34 AND sort_order = 2);

-- No.21 원더우먼 1984 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.21 티켓 (2번째)', '2020. 12. 23. 발행', ci.category_id, 36, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 36 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 36 AND sort_order = 2);

-- No.23 톰과 제리 (2종+투명지 2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.23 티켓 (2번째)', '2021. 2. 24. 발행', ci.category_id, 38, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 38 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 38 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.23 투명지 (1번째)', '2021. 2. 24. 발행', ci.category_id, 38, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 38 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 38 AND sort_order = 3);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.23 투명지 (2번째)', '2021. 2. 24. 발행', ci.category_id, 38, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 38 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 38 AND sort_order = 4);

-- No.26 서복 (2종+투명지 2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.26 티켓 (2번째)', '2021. 4. 15. 발행', ci.category_id, 41, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 41 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 41 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.26 투명지 (1번째)', '2021. 4. 15. 발행', ci.category_id, 41, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 41 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 41 AND sort_order = 3);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.26 투명지 (2번째)', '2021. 4. 15. 발행', ci.category_id, 41, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 41 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 41 AND sort_order = 4);

-- No.27 분노의 질주: 더 얼티메이트 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.27 티켓 (2번째)', '2021. 5. 19. 발행', ci.category_id, 42, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 42 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 42 AND sort_order = 2);

-- No.43 스파이더맨: 노 웨이 홈 (3종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.43 티켓 (2번째)', '2021. 12. 15. 발행', ci.category_id, 58, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 58 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 58 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.43 티켓 (3번째)', '2021. 12. 15. 발행', ci.category_id, 58, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 58 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 58 AND sort_order = 3);

-- No.48 더 배트맨 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.48 티켓 (2번째)', '2022. 3. 1. 발행', ci.category_id, 63, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 63 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 63 AND sort_order = 2);

-- No.50 신비한 동물들과 덤블도어의 비밀 (3종) - HTML에 이미지 2장 있음
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.50 티켓 (2번째)', '2022. 4. 13. 발행',
  ci.category_id, 65, ci.owner_id, 'collected',
  'https://i.namu.wiki/i/bOxO2VMOmPkvuLC0xUTahvqQCKoTeBd_ditheSO3Jq1ETHudkAjZlMaCAjwHvZ2t1t3BL2V1E4Tzjxx7Z_O-R9VfHerpnDyOiDohvGuPi8mdTEFleu303CjHmzVO8lfIACwDaoDBnmGamn_-M1oU3w.webp',
  'https://i.namu.wiki/i/bOxO2VMOmPkvuLC0xUTahvqQCKoTeBd_ditheSO3Jq1ETHudkAjZlMaCAjwHvZ2t1t3BL2V1E4Tzjxx7Z_O-R9VfHerpnDyOiDohvGuPi8mdTEFleu303CjHmzVO8lfIACwDaoDBnmGamn_-M1oU3w.webp',
  '#635B52', 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 65 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 65 AND sort_order = 2);

-- No.50 3번째 이미지 (HTML에서 확인된 2번째 이미지)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.50 티켓 (3번째)', '2022. 4. 13. 발행',
  ci.category_id, 65, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 65 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 65 AND sort_order = 3);

-- No.56 헤어질 결심 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.56 티켓 (2번째)', '2022. 6. 29. 발행', ci.category_id, 71, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 71 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 71 AND sort_order = 2);

-- No.57 토르: 러브 앤 썬더 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.57 티켓 (2번째)', '2022. 7. 13. 발행', ci.category_id, 72, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 72 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 72 AND sort_order = 2);

-- No.64 원피스 필름 레드 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.64 티켓 (2번째)', '2022. 11. 30. 발행', ci.category_id, 91, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 91 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 91 AND sort_order = 2);

-- No.65 아바타: 물의 길 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.65 티켓 (2번째)', '2022. 12. 21. 발행', ci.category_id, 92, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 92 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 92 AND sort_order = 2);

-- No.66 더 퍼스트 슬램덩크 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.66 티켓 (2번째)', '2023. 1. 4. 발행', ci.category_id, 93, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 93 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 93 AND sort_order = 2);

-- No.76 드림 (1종+커버 2종 → 커버 2종 추가)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.76 커버 (1번째)', '2023. 4. 29. 발행', ci.category_id, 103, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 103 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 103 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.76 커버 (2번째)', '2023. 4. 29. 발행', ci.category_id, 103, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 103 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 103 AND sort_order = 3);

-- No.103 듄: 파트 2 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.103 티켓 (2번째)', '2024. 2. 28. 발행', ci.category_id, 130, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 130 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 130 AND sort_order = 2);

-- No.115 탈주 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.115 티켓 (2번째)', '2024. 7. 3. 발행', ci.category_id, 142, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 142 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 142 AND sort_order = 2);

-- No.121 룩 백 (2종+4컷 만화 용지 1종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.121 티켓 (2번째)', '2024. 9. 5. 발행', ci.category_id, 148, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 148 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 148 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.121 4컷 만화 용지', '2024. 9. 5. 발행', ci.category_id, 148, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 148 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 148 AND sort_order = 3);

-- No.126 위키드 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.126 티켓 (2번째)', '2024. 11. 20. 발행', ci.category_id, 153, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 153 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 153 AND sort_order = 2);

-- No.133 미키 17 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.133 티켓 (2번째)', '2025. 2. 28. 발행', ci.category_id, 160, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 160 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 160 AND sort_order = 2);

-- No.136 기동전사 건담 지쿠악스 비기닝 (2종+케이스 1종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.136 티켓 (2번째)', '2025. 4. 10. 발행', ci.category_id, 163, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 163 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 163 AND sort_order = 2);

INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.136 케이스', '2025. 4. 10. 발행', ci.category_id, 163, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 163 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 163 AND sort_order = 3);

-- No.141 드래곤 길들이기 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.141 티켓 (2번째)', '2025. 6. 6. 발행', ci.category_id, 168, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 168 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 168 AND sort_order = 2);

-- No.147 얼굴 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.147 티켓 (2번째)', '2025. 9. 12. 발행', ci.category_id, 174, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 174 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 174 AND sort_order = 2);

-- No.152 베이비걸 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.152 티켓 (2번째)', '2025. 10. 29. 발행', ci.category_id, 179, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 179 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 179 AND sort_order = 2);

-- No.155 위키드: 포 굿 (2종)
INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, sort_order, created_at, updated_at)
SELECT 'OGT No.155 티켓 (2번째)', '2025. 11. 19. 발행', ci.category_id, 182, ci.owner_id, 'collected',
  ci.image_url, ci.image_url, ci.color, 1, 0, 0, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM catalog_items ci WHERE ci.catalog_group_id = 182 AND ci.sort_order = 1
  AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 182 AND sort_order = 2);

-- ============================================================
-- 실행 후 검증 쿼리
-- SELECT g.name, g.description, COUNT(ci.id) as item_count
-- FROM catalog_groups g
-- LEFT JOIN catalog_items ci ON ci.catalog_group_id = g.id
-- WHERE g.name LIKE 'OGT%'
-- GROUP BY g.id ORDER BY g.id;
-- ============================================================
