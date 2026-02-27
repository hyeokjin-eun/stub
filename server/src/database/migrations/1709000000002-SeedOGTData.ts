import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedOGTData1709000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 시스템 유저 생성 (seed 데이터 소유자)
    await queryRunner.query(`
      INSERT OR IGNORE INTO users (email, nickname, bio, oauth_provider, oauth_id, created_at, updated_at)
      VALUES ('system@otbook.app', 'otbook_official', '오티북 공식 계정', 'system', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    // 2. CINEMA 카테고리 ID 조회 후 catalog_group 생성
    await queryRunner.query(`
      INSERT INTO catalog_groups (name, description, category_id, creator_id, is_official, color, icon, is_public, created_at, updated_at)
      SELECT
        '오리지널 티켓',
        '메가박스 오리지널 티켓(OT) 컬렉션. 2019년 런칭 이후 발행된 넘버링 굿즈 티켓 목록.',
        c.id,
        u.id,
        1,
        '#FF6B35',
        'ticket',
        1,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM categories c, users u
      WHERE c.code = 'CINEMA' AND u.nickname = 'otbook_official'
    `);

    // 3. 오리지널 티켓 아이템 12종 삽입
    await queryRunner.query(`
      INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, created_at, updated_at)
      SELECT
        t.title,
        t.description,
        c.id,
        g.id,
        u.id,
        'collected',
        t.image_url,
        t.image_url,
        t.color,
        1,
        0,
        0,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM categories c
      JOIN catalog_groups g ON g.name = '오리지널 티켓'
      JOIN users u ON u.nickname = 'otbook_official'
      JOIN (
        SELECT 1 AS sort_order, 'OGT No.1 스파이더맨: 파 프롬 홈' AS title, '2019. 7. 4. 발행 | 3종' AS description, 'https://i.namu.wiki/i/EAF1Sj2VHp8Hbd_RX6nKD69eIpiI5gi6CrkAvGM6Wt--mmm9mRDYEKesQfSZ6psfmMat3fA8JBdCcAdIgPNNSzuYqXN2ve75j3yqLqqqD52ImxHCSiSIs-HsosIJqegri8sjQS1t6HiJliGIhLekkw.webp' AS image_url, '#EB0F0F' AS color
        UNION ALL SELECT 2, 'OGT No.2 라이온 킹', '2019. 7. 19. 발행 | 3종', 'https://i.namu.wiki/i/xaU6d1uIhgIX_k7xx4j9BNxk6E07FbdwwgE4LaEUPQN8mb6_FTgoDeFY2N-_DzvLq1T9JSSeLory0zTsSsbRFoEAiefzttU1D1UCR6WabeYrQW4CQ3NNRtp1IcJ8ysFVsEsZptqS7GY1Ysj0p2IfMQ.webp', '#EB5D0F'
        UNION ALL SELECT 3, 'OGT No.3 나랏말싸미', '2019. 7. 24. 발행 | 1종', 'https://i.namu.wiki/i/E7EQwU4ylKECHXgiTtP88xHe-PvjPsTOhX62sQzPADFwXvq3a7icueg_hgIPTInZUMP1QcjXEgvX1X7JPi-JbNqC9eaKmol5wfyRC0FoIC2buwRmx-xUSfoY736FULEJFToj47pFqq0Tp0DAllC7iw.webp', '#856F4C'
        UNION ALL SELECT 4, 'OGT No.4 타짜: 원 아이드 잭', '2019. 9. 11. 발행 | 2종', 'https://i.namu.wiki/i/oyptWZZ3Iw8yEgsPT925oVWERAeQPhZZD5inu9SDxN1Y_iKTNG3wEi317eBQZHHWeaxgxC83Lr_22LvWQSZKhSs3CsnR-1Jtxz-xqiLidKF3VKSwxQxGpS2l1d8auSJg3bYO6OmR90iqkNHTxo1Uog.webp', '#F2340F'
        UNION ALL SELECT 5, 'OGT No.5 원스 어폰 어 타임... 인 할리우드', '2019. 9. 25. 발행 | 2종', 'https://i.namu.wiki/i/IBPR8G9Nqyddh3vvpi8ah2cVi8g3lXRpAtbXMMV5eoI-Uz73syL5axOcLYLqqnR3RK5Y7chr5PGABNPneUGiTRCxT9k426PrE6d_OpcdI6DYylD_RI13PKdEgmMBv5ovGhruM5IPao4puU8yQVb_Yg.webp', '#FB9800'
        UNION ALL SELECT 6, 'OGT No.6 조커', '2019. 10. 2. 발행 | 1종+투명지 1종', 'https://i.namu.wiki/i/p9earc2m8wMs_r1UX_7nJ37c-bGUB6FZYr7BjxUT3-4D-l4RVl6Ofs6fx_0lACoa9lt4gSA9siFyOvBLbr629B0rQ2aoVQT4unFoOOmuWXSgSDZ8_Y44XJe4juTaNBtguj9B4uiwIbZGEIQ2epZAJw.webp', '#00905A'
        UNION ALL SELECT 7, 'OGT No.7 말레피센트 2', '2019. 10. 17. 발행 | 1종', 'https://i.namu.wiki/i/jTBmlFCTKJ1GxhDRd_4AM_0Q-xmX3VXHZd_U-63VSxLypaPTE5J2CScZX2Uf8XcRkdo2K_cNhXhjJmD3dXM8HyfzCKrXl10hYGdoKVz1yMQ5CmPDBONs_neiw6ObrP4FV5a28Um3w_Yyg78-t6hQBQ.webp', '#43A964'
        UNION ALL SELECT 8, 'OGT No.8 날씨의 아이', '2019. 10. 30. 발행 | 2종', 'https://i.namu.wiki/i/eJZUvm_uOIiUYRGWrR6anocVBPJP4yj92emUse_ErpbaNZdIBwBRZ7vh4AxSWBldOOg52mWmN8gaCE4VfCEllRTEpvrbn9wqbvHeAi82AlzV_Qv9oFCWWjfbLIyw3hl0yyulVahEnksCs9gGfNSXww.webp', '#00BFE7'
        UNION ALL SELECT 9, 'OGT No.9 겨울왕국 2', '2019. 11. 21. 발행 | 3종+스페셜 클립 1종', 'https://i.namu.wiki/i/RLyOAKwShDbcA6iyy05deRdcr4kqeIMoAl6mCCnaXM-nCPtgJGR_rR-gjW6slwetoXew-mhXIyf1IDYO7r0ibMF4ktxONy-KJDEDaE6QTvKIPX_Ohhq3UOL4xpZsJUX1Emesu6OtBTOfQUG8qeKH_A.webp', '#0082E3'
        UNION ALL SELECT 10, 'OGT No.10 포드 V 페라리', '2019. 12. 4. 발행 | 1종+투명지 2종', 'https://i.namu.wiki/i/Plr28XnuBPn6uQAxcZU4xf_XfhkpjcfTjBknfV8nLMJiD4b6p2-niqjHveIM-HmF6Gn9xS0Y0v9QComrwQAojpj7XoQc9I9hbDCXjrVYwV22sEgSsCgV3U6naBTu7V_m4MiiO7Woz4Hvsyj7VCda9A.webp', '#EA071A'
        UNION ALL SELECT 11, 'OGT No.11 캣츠', '2019. 12. 24. 발행 | 2종', 'https://i.namu.wiki/i/_g_pFMUajSpYjsUyL6ch52-ZZK5pvCZ_ypu2Rg6w9H4_1KjbVK-Ehwz0IoruSL6B7Jr4Y2e5CS0X18ZC6M1qnuOJevW96D9Ma69gLkN6JuSHmBohDZzqIwG05cb0zD_nCN30bm9JAO7awJybMMN-xw.webp', '#9F1CCC'
        UNION ALL SELECT 12, 'OGT No.12 스타워즈: 라이즈 오브 스카이워커', '2020. 1. 8. 발행 | 2종', 'https://i.namu.wiki/i/_a67RD1oIVnKEnZckeUfAfZJ-qavWPCA7JKn_1yW4ymNi_WyA6QzqIGfUFw-xW2IVby1IjwZ-lHJeKYRAdF312tYdBN0bC4Ict5Ytzn9_hmbF6H7xxhYjgsxW1VDWUDXXYi057KCDt4ltfhKVHoICw.webp', '#0083D0'
      ) AS t
      WHERE c.code = 'CINEMA'
      ORDER BY t.sort_order
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // catalog_items 삭제
    await queryRunner.query(`
      DELETE FROM catalog_items
      WHERE catalog_group_id IN (
        SELECT id FROM catalog_groups WHERE name = '오리지널 티켓'
      )
    `);
    // catalog_group 삭제
    await queryRunner.query(`DELETE FROM catalog_groups WHERE name = '오리지널 티켓'`);
    // 시스템 유저 삭제
    await queryRunner.query(`DELETE FROM users WHERE nickname = 'otbook_official'`);
  }
}
