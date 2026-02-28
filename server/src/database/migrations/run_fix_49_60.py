import sqlite3

conn = sqlite3.connect('/Users/musinsa/Desktop/project/invi/stub/server/otbook.sqlite')
cur = conn.cursor()

statements = [
    # No.50 (3종) - 2번째 티켓
    ("OGT No.50 티켓 2번째 INSERT",
     """INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, icon, is_public, like_count, view_count, sort_order, created_at, updated_at)
        SELECT 'OGT No.50 티켓 (2번째)', '2022. 4. 13. 발행', ci.category_id, ci.catalog_group_id, ci.owner_id, 'collected',
        'https://i.namu.wiki/i/Ylovmx5wS6ZFrOLPTPNfSd2pDskR2PIINUyJ4cB_IFpTGUa-t8xGEYg9HlUwhvodvQ7oJvLuoIJiaGlWEzYnO7ol-kpjEbqLDuqePOZv6mBnhOteCXctLz-qYcDR4lFPlQkHvfYAfFIolmfnKoy9Pw.webp',
        'https://i.namu.wiki/i/Ylovmx5wS6ZFrOLPTPNfSd2pDskR2PIINUyJ4cB_IFpTGUa-t8xGEYg9HlUwhvodvQ7oJvLuoIJiaGlWEzYnO7ol-kpjEbqLDuqePOZv6mBnhOteCXctLz-qYcDR4lFPlQkHvfYAfFIolmfnKoy9Pw.webp',
        ci.color, ci.icon, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM catalog_items ci WHERE ci.id = 75
        AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 65 AND title = 'OGT No.50 티켓 (2번째)')"""),
    # No.50 (3종) - 3번째 티켓
    ("OGT No.50 티켓 3번째 INSERT",
     """INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, icon, is_public, like_count, view_count, sort_order, created_at, updated_at)
        SELECT 'OGT No.50 티켓 (3번째)', '2022. 4. 13. 발행', ci.category_id, ci.catalog_group_id, ci.owner_id, 'collected',
        'https://i.namu.wiki/i/bOxO2VMOmPkvuLC0xUTahvqQCKoTeBd_ditheSO3Jq1ETHudkAjZlMaCAjwHvZ2t1t3BL2V1E4Tzjxx7Z_O-R9VfHerpnDyOiDohvGuPi8mdTEFleu303CjHmzVO8lfIACwDaoDBnmGamn_-M1oU3w.webp',
        'https://i.namu.wiki/i/bOxO2VMOmPkvuLC0xUTahvqQCKoTeBd_ditheSO3Jq1ETHudkAjZlMaCAjwHvZ2t1t3BL2V1E4Tzjxx7Z_O-R9VfHerpnDyOiDohvGuPi8mdTEFleu303CjHmzVO8lfIACwDaoDBnmGamn_-M1oU3w.webp',
        ci.color, ci.icon, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM catalog_items ci WHERE ci.id = 75
        AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 65 AND title = 'OGT No.50 티켓 (3번째)')"""),
    # No.50 기존 1번째로 rename
    ("OGT No.50 티켓 1번째 UPDATE",
     "UPDATE catalog_items SET title = 'OGT No.50 티켓 (1번째)', updated_at = CURRENT_TIMESTAMP WHERE id = 75 AND title = 'OGT No.50 티켓'"),
    # No.51 투명지
    ("OGT No.51 투명지 INSERT",
     """INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, icon, is_public, like_count, view_count, sort_order, created_at, updated_at)
        SELECT 'OGT No.51 투명지', '2022. 5. 11. 발행', ci.category_id, ci.catalog_group_id, ci.owner_id, 'collected',
        ci.image_url, ci.thumbnail_url, ci.color, ci.icon, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM catalog_items ci WHERE ci.id = 76
        AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 66 AND title = 'OGT No.51 투명지')"""),
    # No.54 스티커
    ("OGT No.54 스티커 INSERT",
     """INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, icon, is_public, like_count, view_count, sort_order, created_at, updated_at)
        SELECT 'OGT No.54 스티커', '2022. 6. 15. 발행', ci.category_id, ci.catalog_group_id, ci.owner_id, 'collected',
        ci.image_url, ci.thumbnail_url, ci.color, ci.icon, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM catalog_items ci WHERE ci.id = 79
        AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 69 AND title = 'OGT No.54 스티커')"""),
    # No.56 2번째 티켓
    ("OGT No.56 티켓 2번째 INSERT",
     """INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, icon, is_public, like_count, view_count, sort_order, created_at, updated_at)
        SELECT 'OGT No.56 티켓 (2번째)', '2022. 6. 29. 발행', ci.category_id, ci.catalog_group_id, ci.owner_id, 'collected',
        ci.image_url, ci.thumbnail_url, ci.color, ci.icon, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM catalog_items ci WHERE ci.id = 81
        AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 71 AND title = 'OGT No.56 티켓 (2번째)')"""),
    ("OGT No.56 티켓 1번째 UPDATE",
     "UPDATE catalog_items SET title = 'OGT No.56 티켓 (1번째)', updated_at = CURRENT_TIMESTAMP WHERE id = 81 AND title = 'OGT No.56 티켓'"),
    # No.57 2번째 티켓
    ("OGT No.57 티켓 2번째 INSERT",
     """INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, icon, is_public, like_count, view_count, sort_order, created_at, updated_at)
        SELECT 'OGT No.57 티켓 (2번째)', '2022. 7. 13. 발행', ci.category_id, ci.catalog_group_id, ci.owner_id, 'collected',
        ci.image_url, ci.thumbnail_url, ci.color, ci.icon, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM catalog_items ci WHERE ci.id = 82
        AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 72 AND title = 'OGT No.57 티켓 (2번째)')"""),
    ("OGT No.57 티켓 1번째 UPDATE",
     "UPDATE catalog_items SET title = 'OGT No.57 티켓 (1번째)', updated_at = CURRENT_TIMESTAMP WHERE id = 82 AND title = 'OGT No.57 티켓'"),
    # No.59 스티커
    ("OGT No.59 스티커 INSERT",
     """INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, icon, is_public, like_count, view_count, sort_order, created_at, updated_at)
        SELECT 'OGT No.59 스티커', '2022. 8. 3. 발행', ci.category_id, ci.catalog_group_id, ci.owner_id, 'collected',
        ci.image_url, ci.thumbnail_url, ci.color, ci.icon, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM catalog_items ci WHERE ci.id = 84
        AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 74 AND title = 'OGT No.59 스티커')"""),
    # No.60 커버
    ("OGT No.60 커버 INSERT",
     """INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, icon, is_public, like_count, view_count, sort_order, created_at, updated_at)
        SELECT 'OGT No.60 커버', '2022. 8. 10. 발행', ci.category_id, ci.catalog_group_id, ci.owner_id, 'collected',
        ci.image_url, ci.thumbnail_url, ci.color, ci.icon, 1, 0, 0, ci.sort_order, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM catalog_items ci WHERE ci.id = 85
        AND NOT EXISTS (SELECT 1 FROM catalog_items WHERE catalog_group_id = 75 AND title = 'OGT No.60 커버')"""),
]

errors = []
for name, stmt in statements:
    try:
        cur.execute(stmt)
        print(f'OK [{cur.rowcount}행]: {name}')
    except Exception as e:
        errors.append((name, str(e)))
        print(f'ERROR: {name} => {e}')

conn.commit()
print(f'\n완료. 오류: {len(errors)}개')

print('\n=== 최종 검증 ===')
cur.execute('''
SELECT ci.sort_order, COUNT(ci.id) cnt, GROUP_CONCAT(ci.title, " / ") titles
FROM catalog_items ci
WHERE ci.sort_order BETWEEN 49 AND 60
GROUP BY ci.catalog_group_id
ORDER BY ci.sort_order
''')
for r in cur.fetchall():
    status = "✅" if r[1] > 1 else "  "
    print(f'{status} No.{r[0]}: {r[1]}개 | {r[2]}')
conn.close()
