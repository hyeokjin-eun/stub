import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentGroupAndReseedOGT1709000000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. catalog_groups에 parent_group_id 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE catalog_groups ADD COLUMN parent_group_id INTEGER REFERENCES catalog_groups(id)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_catalog_groups_parent ON catalog_groups(parent_group_id)
    `);

    // 2. 기존 OGT seed 데이터 정리 (이전 migration에서 넣은 것)
    await queryRunner.query(`
      DELETE FROM catalog_items
      WHERE catalog_group_id IN (SELECT id FROM catalog_groups WHERE name = '오리지널 티켓')
    `);
    await queryRunner.query(`DELETE FROM catalog_groups WHERE name = '오리지널 티켓'`);

    // 3. 최상위 그룹: 오리지널 티켓
    await queryRunner.query(`
      INSERT INTO catalog_groups (name, description, category_id, creator_id, is_official, color, icon, is_public, parent_group_id, created_at, updated_at)
      SELECT
        '오리지널 티켓',
        '메가박스 오리지널 티켓(OT) 컬렉션. 2019년 런칭 이후 발행된 넘버링 굿즈 티켓 목록.',
        c.id, u.id, 1, '#FF6B35', 'ticket', 1, NULL,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM categories c, users u
      WHERE c.code = 'CINEMA' AND u.nickname = 'otbook_official'
    `);

    // 4. 영화별 하위 그룹 12개 생성
    await queryRunner.query(`
      INSERT INTO catalog_groups (name, description, category_id, creator_id, is_official, color, icon, is_public, parent_group_id, created_at, updated_at)
      SELECT
        t.name, t.description,
        c.id, u.id, 1, t.color, 'movie', 1,
        (SELECT id FROM catalog_groups WHERE name = '오리지널 티켓'),
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM categories c, users u
      JOIN (
        SELECT 1 AS sort_order, 'OGT No.1 스파이더맨: 파 프롬 홈' AS name, '2019. 7. 4. 발행 | 3종' AS description, '#EB0F0F' AS color
        UNION ALL SELECT 2, 'OGT No.2 라이온 킹',                          '2019. 7. 19. 발행 | 3종',               '#EB5D0F'
        UNION ALL SELECT 3, 'OGT No.3 나랏말싸미',                          '2019. 7. 24. 발행 | 1종',               '#856F4C'
        UNION ALL SELECT 4, 'OGT No.4 타짜: 원 아이드 잭',                  '2019. 9. 11. 발행 | 2종',               '#F2340F'
        UNION ALL SELECT 5, 'OGT No.5 원스 어폰 어 타임... 인 할리우드',     '2019. 9. 25. 발행 | 2종',               '#FB9800'
        UNION ALL SELECT 6, 'OGT No.6 조커',                               '2019. 10. 2. 발행 | 1종+투명지 1종',    '#00905A'
        UNION ALL SELECT 7, 'OGT No.7 말레피센트 2',                        '2019. 10. 17. 발행 | 1종',              '#43A964'
        UNION ALL SELECT 8, 'OGT No.8 날씨의 아이',                         '2019. 10. 30. 발행 | 2종',              '#00BFE7'
        UNION ALL SELECT 9, 'OGT No.9 겨울왕국 2',                         '2019. 11. 21. 발행 | 3종+스페셜 클립 1종','#0082E3'
        UNION ALL SELECT 10,'OGT No.10 포드 V 페라리',                      '2019. 12. 4. 발행 | 1종+투명지 2종',    '#EA071A'
        UNION ALL SELECT 11,'OGT No.11 캣츠',                              '2019. 12. 24. 발행 | 2종',              '#9F1CCC'
        UNION ALL SELECT 12,'OGT No.12 스타워즈: 라이즈 오브 스카이워커',     '2020. 1. 8. 발행 | 2종',               '#0083D0'
        UNION ALL SELECT 13,'OGT No.13 남산의 부장들',                       '2020. 1. 22. 발행 | 1종',              '#514F4B'
        UNION ALL SELECT 14,'OGT No.14 버즈 오브 프레이',                    '2020. 2. 5. 발행 | 2종+스티커 1종',       '#FD426D'
        UNION ALL SELECT 15,'OGT No.15 지푸라기라도 잡고 싶은 짐승들',         '2020. 2. 19. 발행 | 1종+투명지 1종',      '#000000'
        UNION ALL SELECT 16,'OGT No.16 온워드: 단 하루의 기적',               '2020. 6. 17. 발행 | 1종+스페셜 클립북 1종','#2E00C9'
        UNION ALL SELECT 17,'OGT No.17 반도',                               '2020. 7. 15. 발행 | 1종',              '#895E0B'
        UNION ALL SELECT 18,'OGT No.18 다만 악에서 구하소서',                 '2020. 8. 5. 발행 | 2종+투명지 2종',       '#6B550E'
        UNION ALL SELECT 19,'OGT No.19 테넷',                               '2020. 8. 26. 발행 | 2종',              '#146CA1'
        UNION ALL SELECT 20,'OGT No.20 뮬란',                               '2020. 9. 17. 발행 | 1종',              '#900E00'
        UNION ALL SELECT 21,'OGT No.21 원더우먼 1984',                       '2020. 12. 23. 발행 | 2종',             '#297618'
        UNION ALL SELECT 22,'OGT No.22 소울',                               '2021. 1. 20. 발행 | 1종',              '#009CC9'
        UNION ALL SELECT 23,'OGT No.23 톰과 제리',                           '2021. 2. 24. 발행 | 2종+투명지 2종',      '#EAA900'
        UNION ALL SELECT 24,'OGT No.24 미나리',                              '2021. 3. 3. 발행 | 1종+투명지 1종+종이 스탠드 1종','#729A17'
        UNION ALL SELECT 25,'OGT No.25 자산어보',                            '2021. 3. 31. 발행 | 1종',              '#4B4B4B'
        UNION ALL SELECT 26,'OGT No.26 서복',                               '2021. 4. 15. 발행 | 2종+투명지 2종',      '#02748C'
        UNION ALL SELECT 27,'OGT No.27 분노의 질주: 더 얼티메이트',            '2021. 5. 19. 발행 | 2종',              '#375CAB'
        UNION ALL SELECT 28,'OGT No.28 크루엘라',                            '2021. 5. 26. 발행 | 1종+투명지 1종',      '#E82B17'
        UNION ALL SELECT 29,'OGT No.29 루카',                               '2021. 6. 17. 발행 | 1종+스티커 1종',      '#1BB9F6'
        UNION ALL SELECT 30,'OGT No.30 인 더 하이츠',                        '2021. 6. 30. 발행 | 1종+스티커 1종',      '#532C83'
        UNION ALL SELECT 31,'OGT No.31 블랙 위도우',                         '2021. 7. 14. 발행 | 1종+티켓 홀더 1종',   '#E90520'
        UNION ALL SELECT 32,'OGT No.32 정글 크루즈',                         '2021. 7. 28. 발행 | 1종',              '#4BA924'
        UNION ALL SELECT 33,'OGT No.33 더 수어사이드 스쿼드',                  '2021. 8. 4. 발행 | 1종',               '#1E57B6'
        UNION ALL SELECT 34,'OGT No.34 프리 가이',                           '2021. 8. 11. 발행 | 1종',              '#3385BF'
        UNION ALL SELECT 35,'OGT No.35 샹치와 텐 링즈의 전설',                '2021. 9. 1. 발행 | 1종',               '#BA3609'
        UNION ALL SELECT 36,'OGT No.36 007 노 타임 투 다이',                 '2021. 9. 29. 발행 | 1종',              '#D39214'
        UNION ALL SELECT 37,'OGT No.37 베놈 2: 렛 데어 비 카니지',            '2021. 10. 13. 발행 | 1종',             '#9A0100'
        UNION ALL SELECT 38,'OGT No.38 듄',                                 '2021. 10. 20. 발행 | 1종+스탠드 1종',     '#2D4B49'
        UNION ALL SELECT 39,'OGT No.39 고장난 론',                           '2021. 10. 27. 발행 | 1종+스티커 1종',     '#5790FF'
        UNION ALL SELECT 40,'OGT No.40 이터널스',                            '2021. 11. 10. 발행 | 1종',             '#E8B663'
        UNION ALL SELECT 41,'OGT No.41 유체이탈자',                          '2021. 11. 24. 발행 | 1종',             '#653C82'
        UNION ALL SELECT 42,'OGT No.42 리슨',                               '2021. 12. 9. 발행 | 1종',              '#FF7586'
        UNION ALL SELECT 43,'OGT No.43 스파이더맨: 노 웨이 홈',               '2021. 12. 15. 발행 | 3종',             '#B11313'
        UNION ALL SELECT 44,'OGT No.44 킹스맨: 퍼스트 에이전트',              '2021. 12. 22. 발행 | 1종+봉투 1종+종이 로고 1종+미션지 1종','#FECB5F'
        UNION ALL SELECT 45,'OGT No.45 웨스트 사이드 스토리',                 '2022. 1. 12. 발행 | 1종',              '#BC000F'
        UNION ALL SELECT 46,'OGT No.46 킹메이커',                            '2022. 1. 26. 발행 | 1종',              '#76451C'
        UNION ALL SELECT 47,'OGT No.47 나일 강의 죽음',                      '2022. 2. 9. 발행 | 1종',               '#DA7036'
        UNION ALL SELECT 48,'OGT No.48 더 배트맨',                           '2022. 3. 1. 발행 | 2종',               '#FF0000'
        UNION ALL SELECT 49,'OGT No.49 모비우스',                            '2022. 3. 30. 발행 | 1종',              '#CF2027'
        UNION ALL SELECT 50,'OGT No.50 신비한 동물들과 덤블도어의 비밀',         '2022. 4. 13. 발행 | 3종',              '#635B52'
        UNION ALL SELECT 51,'OGT No.51 닥터 스트레인지: 대혼돈의 멀티버스',      '2022. 5. 11. 발행 | 1종+투명지 1종',      '#AA2828'
        UNION ALL SELECT 52,'OGT No.52 범죄도시 2',                          '2022. 5. 18. 발행 | 1종',              '#FAB914'
        UNION ALL SELECT 53,'OGT No.53 쥬라기 월드: 도미니언',                 '2022. 6. 1. 발행 | 1종',               '#00375F'
        UNION ALL SELECT 54,'OGT No.54 버즈 라이트이어',                       '2022. 6. 15. 발행 | 1종+스티커 1종',      '#280F46'
        UNION ALL SELECT 55,'OGT No.55 탑건: 매버릭',                         '2022. 6. 25. 발행 | 1종',              '#AA7841'
        UNION ALL SELECT 56,'OGT No.56 헤어질 결심',                          '2022. 6. 29. 발행 | 2종',              '#46462D'
        UNION ALL SELECT 57,'OGT No.57 토르: 러브 앤 썬더',                    '2022. 7. 13. 발행 | 2종',              '#1E5082'
        UNION ALL SELECT 58,'OGT No.58 미니언즈 2',                           '2022. 7. 20. 발행 | 1종',              '#FAB914'
        UNION ALL SELECT 59,'OGT No.59 비상선언',                             '2022. 8. 3. 발행 | 1종+스티커 1종',       '#41646E'
        UNION ALL SELECT 60,'OGT No.60 헌트',                                '2022. 8. 10. 발행 | 1종+커버 1종',       '#D23C00'
        UNION ALL SELECT 61,'OGT No.61 오펀: 천사의 탄생',                     '2022. 10. 12. 발행 | 1종+투명지 1종',     '#7E0709'
        UNION ALL SELECT 62,'OGT No.62 에브리씽 에브리웨어 올 앳 원스',          '2022. 10. 15. 발행 | 1종+스티커 1종',     '#000000'
        UNION ALL SELECT 63,'OGT No.63 블랙 아담',                             '2022. 10. 19. 발행 | 1종',              '#F2B33D'
        UNION ALL SELECT 64,'OGT No.64 원피스 필름 레드',                       '2022. 11. 30. 발행 | 2종',              '#EA2024'
        UNION ALL SELECT 65,'OGT No.65 아바타: 물의 길',                        '2022. 12. 21. 발행 | 2종',              '#0067AE'
        UNION ALL SELECT 66,'OGT No.66 더 퍼스트 슬램덩크',                     '2023. 1. 4. 발행 | 2종',                '#FA9906'
        UNION ALL SELECT 67,'OGT No.67 교섭',                                  '2023. 1. 18. 발행 | 1종',               '#393126'
        UNION ALL SELECT 68,'OGT No.68 바빌론',                                '2023. 2. 1. 발행 | 1종',                '#8B4513'
        UNION ALL SELECT 69,'OGT No.69 앤트맨과 와스프: 퀀텀매니아',             '2023. 2. 15. 발행 | 1종+미니 티켓 1종',   '#269EC1'
        UNION ALL SELECT 70,'OGT No.70 대외비',                                '2023. 3. 1. 발행 | 1종+종이 봉투 1종+히든 티켓 1종','#B02D23'
        UNION ALL SELECT 71,'OGT No.71 스즈메의 문단속',                        '2023. 3. 8. 발행 | 1종+티켓 커버 1종',    '#7CB8DC'
        UNION ALL SELECT 72,'OGT No.72 샤잠! 신들의 분노',                      '2023. 3. 15. 발행 | 1종',               '#FEEE96'
        UNION ALL SELECT 73,'OGT No.73 에어',                                  '2023. 4. 5. 발행 | 1종+포장지 1종+커버 1종','#D20F1C'
        UNION ALL SELECT 74,'OGT No.74 존 윅 4',                               '2023. 4. 12. 발행 | 1종+시크릿 티켓 1종',  '#E66C29'
        UNION ALL SELECT 75,'OGT No.75 슈퍼 마리오 브라더스',                    '2023. 4. 26. 발행 | 1종',                  '#0238F4'
        UNION ALL SELECT 76,'OGT No.76 드림',                                  '2023. 4. 29. 발행 | 1종+커버 2종',          '#0D552D'
        UNION ALL SELECT 77,'OGT No.77 가디언즈 오브 갤럭시: Volume 3',           '2023. 5. 3. 발행 | 1종',                   '#FA6042'
        UNION ALL SELECT 78,'OGT No.78 슬픔의 삼각형',                           '2023. 5. 17. 발행 | 1종+수하물 태그 1종',   '#3E7B98'
        UNION ALL SELECT 79,'OGT No.79 인어공주',                               '2023. 5. 24. 발행 | 1종',                  '#74BACE'
        UNION ALL SELECT 80,'OGT No.80 범죄도시 3',                             '2023. 5. 31. 발행 | 1종+타투 스티커',        '#FDB813'
        UNION ALL SELECT 81,'OGT No.81 플래시',                                '2023. 6. 14. 발행 | 1종',                  '#BDAF82'
        UNION ALL SELECT 82,'OGT No.82 엘리멘탈',                               '2023. 6. 21. 발행 | 1종',                  '#FEDE95'
        UNION ALL SELECT 83,'OGT No.83 보 이즈 어프레이드',                      '2023. 7. 5. 발행 | 1종',                   '#B29B8B'
        UNION ALL SELECT 84,'OGT No.84 바비',                                  '2023. 7. 19. 발행 | 1종+커버 1종',          '#63D1F3'
        UNION ALL SELECT 85,'OGT No.85 밀수',                                  '2023. 7. 26. 발행 | 1종',                  '#F8E77F'
        UNION ALL SELECT 86,'OGT No.86 콘크리트 유토피아',                       '2023. 8. 9. 발행 | 1종',                   '#9BA58A'
        UNION ALL SELECT 87,'OGT No.87 오펜하이머',                             '2023. 8. 15. 발행 | 1종',                  '#FF6E39'
        UNION ALL SELECT 88,'OGT No.88 베니스 유령 살인사건',                    '2023. 9. 13. 발행 | 1종',                  '#E67E2F'
        UNION ALL SELECT 89,'OGT No.89 크리에이터',                             '2023. 10. 4. 발행 | 1종',                  '#A8CFD6'
        UNION ALL SELECT 90,'OGT No.90 화란',                                  '2023. 10. 11. 발행 | 1종+투명지 1종',        '#C63133'
        UNION ALL SELECT 91,'OGT No.91 블루 자이언트',                          '2023. 10. 18. 발행 | 1종+비표 스티커 1종',   '#0A2580'
        UNION ALL SELECT 92,'OGT No.92 그대들은 어떻게 살 것인가',               '2023. 10. 25. 발행 | 1종+비표 스티커 1종',   '#E10101'
        UNION ALL SELECT 93,'OGT No.93 더 마블스',                             '2023. 11. 8. 발행 | 1종',                  '#D0A362'
        UNION ALL SELECT 94,'OGT No.94 서울의 봄',                             '2023. 11. 22. 발행 | 1종+커버 1종',          '#C89A69'
        UNION ALL SELECT 95,'OGT No.95 아쿠아맨과 로스트 킹덤',                  '2023. 12. 20. 발행 | 1종',                 '#8DB7CF'
        UNION ALL SELECT 96,'OGT No.96 노량: 죽음의 바다',                      '2023. 12. 23. 발행 | 1종',                 '#090E14'
        UNION ALL SELECT 97,'OGT No.97 류이치 사카모토: 오퍼스',                 '2023. 12. 30. 발행 | 1종+커버 1종',          '#808080'
        UNION ALL SELECT 98,'OGT No.98 위시',                                   '2024. 1. 3. 발행 | 1종',                    '#6E5CBB'
        UNION ALL SELECT 99,'OGT No.99 도그맨',                                 '2024. 1. 24. 발행 | 1종',                   '#1E0D0E'
        UNION ALL SELECT 100,'OGT No.100 웡카',                                 '2024. 1. 31. 발행 | 1종+초콜릿 커버+페이퍼 초콜릿','#5B165B'
        UNION ALL SELECT 101,'OGT No.101 우견니',                               '2024. 2. 14. 발행 | 1종',                   '#006AD3'
        UNION ALL SELECT 102,'OGT No.102 파묘',                                 '2024. 2. 22. 발행 | 1종+부적 1종',           '#472F27'
        UNION ALL SELECT 103,'OGT No.103 듄: 파트 2',                           '2024. 2. 28. 발행 | 2종',                   '#8A4623'
        UNION ALL SELECT 104,'OGT No.104 가여운 것들',                           '2024. 3. 6. 발행 | 1종',                    '#EA8223'
        UNION ALL SELECT 105,'OGT No.105 메이 디셈버',                           '2024. 3. 13. 발행 | 1종+부속 1종',           '#E3B8A7'
        UNION ALL SELECT 106,'OGT No.106 극장판 스파이 패밀리 코드: 화이트',      '2024. 3. 20. 발행 | 1종',                   '#599BE4'
        UNION ALL SELECT 107,'OGT No.107 쿵푸팬더 4',                           '2024. 4. 10. 발행 | 1종+스티커 1종',         '#F7C69B'
        UNION ALL SELECT 108,'OGT No.108 골드핑거',                             '2024. 4. 13. 발행 | 1종+띠지 1종',           '#FFD700'
        UNION ALL SELECT 109,'OGT No.109 범죄도시4',                            '2024. 4. 24. 발행 | 1종+투명지 1종',         '#9F99A4'
        UNION ALL SELECT 110,'OGT No.110 퓨리오사: 매드맥스 사가',               '2024. 5. 22. 발행 | 1종+PVC 스티커 1종',     '#3196A2'
        UNION ALL SELECT 111,'OGT No.111 드림 시나리오',                         '2024. 5. 29. 발행 | 1종',                   '#D1E317'
        UNION ALL SELECT 112,'OGT No.112 존 오브 인터레스트',                    '2024. 6. 5. 발행 | 1종',                    '#090708'
        UNION ALL SELECT 113,'OGT No.113 인사이드 아웃 2',                      '2024. 6. 12. 발행 | 1종',                   '#4A239A'
        UNION ALL SELECT 114,'OGT No.114 콰이어트 플레이스: 첫째 날',            '2024. 6. 26. 발행 | 1종',                   '#131E38'
        UNION ALL SELECT 115,'OGT No.115 탈주',                                 '2024. 7. 3. 발행 | 2종',                    '#CBCDCC'
        UNION ALL SELECT 116,'OGT No.116 우마무스메 프리티 더비 새로운 시대의 문','2024. 7. 11. 발행 | 1종',                   '#3F7708'
        UNION ALL SELECT 117,'OGT No.117 슈퍼배드 4',                           '2024. 7. 24. 발행 | 1종',                   '#2F3359'
        UNION ALL SELECT 118,'OGT No.118 리볼버',                               '2024. 8. 7. 발행 | 1종+탄창 부속품 1종',     '#0B0C0E'
        UNION ALL SELECT 119,'OGT No.119 에이리언: 로물루스',                    '2024. 8. 14. 발행 | 1종',                   '#023833'
        UNION ALL SELECT 120,'OGT No.120 비틀쥬스 비틀쥬스',                    '2024. 9. 4. 발행 | 1종',                    '#DDD4C5'
        UNION ALL SELECT 121,'OGT No.121 룩 백',                               '2024. 9. 5. 발행 | 2종+4컷 만화 용지 1종',  '#750B21'
        UNION ALL SELECT 122,'OGT No.122 대도시의 사랑법',                      '2024. 10. 1. 발행 | 1종',                   '#01155E'
        UNION ALL SELECT 123,'OGT No.123 조커: 폴리 아 되',                     '2024. 10. 4. 발행 | 1종',                   '#161D30'
        UNION ALL SELECT 124,'OGT No.124 베놈: 라스트 댄스',                    '2024. 10. 23. 발행 | 1종',                  '#0B0914'
        UNION ALL SELECT 125,'OGT No.125 청설',                                '2024. 11. 6. 발행 | 1종',                   '#0052B8'
        UNION ALL SELECT 126,'OGT No.126 위키드',                              '2024. 11. 20. 발행 | 2종',                  '#1F4923'
        UNION ALL SELECT 127,'OGT No.127 모아나 2',                            '2024. 11. 27. 발행 | 1종',                  '#00CDDE'
        UNION ALL SELECT 128,'OGT No.128 무파사: 라이온 킹',                    '2024. 12. 18. 발행 | 1종',                  '#FBCBB4'
        UNION ALL SELECT 129,'OGT No.129 보고타: 마지막 기회의 땅',             '2024. 12. 31. 발행 | 1종+시계 부속품 1종',  '#E1AA57'
        UNION ALL SELECT 130,'OGT No.130 검은 수녀들',                         '2025. 1. 24. 발행 | 1종',                   '#1B191C'
        UNION ALL SELECT 131,'OGT No.131 말할 수 없는 비밀',                   '2025. 1. 27. 발행 | 1종',                   '#B6B2A6'
        UNION ALL SELECT 132,'OGT No.132 첫 번째 키스',                        '2025. 2. 26. 발행 | 1종',                   '#8BA985'
        UNION ALL SELECT 133,'OGT No.133 미키 17',                            '2025. 2. 28. 발행 | 2종',                   '#F2A50B'
        UNION ALL SELECT 134,'OGT No.134 극장판 진격의 거인 완결편 더 라스트 어택','2025. 3. 13. 발행 | 1종',                  '#F0C1A7'
        UNION ALL SELECT 135,'OGT No.135 플로우',                             '2025. 3. 19. 발행 | 1종',                   '#9A9B57'
        UNION ALL SELECT 136,'OGT No.136 기동전사 건담 지쿠악스 비기닝',        '2025. 4. 10. 발행 | 2종+케이스 1종',          '#FFFFFF'
        UNION ALL SELECT 137,'OGT No.137 야당',                               '2025. 4. 16. 발행 | 1종+커버 1종+선글라스 부속품 1종','#FF2D22'
        UNION ALL SELECT 138,'OGT No.138 괴수 8호: 미션 리컨',                 '2025. 5. 7. 발행 | 1종',                    '#000000'
        UNION ALL SELECT 139,'OGT No.139 미션 임파서블: 파이널 레코닝',         '2025. 5. 17. 발행 | 1종',                   '#1D1D1F'
        UNION ALL SELECT 140,'OGT No.140 극장판 프로젝트 세카이 부서진 세카이와 전해지지 않는 미쿠의 노래','2025. 5. 29. 발행 | 1종+투명지 1종','#0184DC'
        UNION ALL SELECT 141,'OGT No.141 드래곤 길들이기',                     '2025. 6. 6. 발행 | 2종',                    '#B5ADA3'
        UNION ALL SELECT 142,'OGT No.142 쥬라기 월드: 새로운 시작',            '2025. 7. 2. 발행 | 1종',                    '#320B0C'
        UNION ALL SELECT 143,'OGT No.143 슈퍼맨',                             '2025. 7. 9. 발행 | 1종',                    '#CF331A'
        UNION ALL SELECT 144,'OGT No.144 좀비딸',                             '2025. 7. 30. 발행 | 1종',                   '#29769F'
        UNION ALL SELECT 145,'OGT No.145 발레리나',                           '2025. 8. 6. 발행 | 1종',                    '#043AC0'
        UNION ALL SELECT 146,'OGT No.146 극장판 귀멸의 칼날: 무한성편',        '2025. 8. 25. 발행 | 1종',                   '#EE811C'
        UNION ALL SELECT 147,'OGT No.147 얼굴',                               '2025. 9. 12. 발행 | 2종',                   '#D9A48D'
        UNION ALL SELECT 148,'OGT No.148 극장판 체인소 맨: 레제편',            '2025. 9. 24. 발행 | 1종',                   '#231C29'
        UNION ALL SELECT 149,'OGT No.149 어쩔수가없다',                       '2025. 10. 1. 발행 | 1종',                   '#FFFFFF'
        UNION ALL SELECT 150,'OGT No.150 극장판 주술회전: 회옥·옥절',         '2025. 10. 16. 발행 | 1종',                  '#0161C3'
        UNION ALL SELECT 151,'OGT No.151 8번 출구',                           '2025. 10. 22. 발행 | 1종',                  '#FDBF00'
        UNION ALL SELECT 152,'OGT No.152 베이비걸',                           '2025. 10. 29. 발행 | 2종',                  '#DADADA'
        UNION ALL SELECT 153,'OGT No.153 프레데터: 죽음의 땅',                '2025. 11. 5. 발행 | 1종',                   '#011031'
        UNION ALL SELECT 154,'OGT No.154 나우 유 씨 미 3',                    '2025. 11. 15. 발행 | 1종',                  '#171C31'
        UNION ALL SELECT 155,'OGT No.155 위키드: 포 굿',                      '2025. 11. 19. 발행 | 2종',                  '#487609'
        UNION ALL SELECT 156,'OGT No.156 국보',                               '2025. 11. 21. 발행 | 1종',                  '#F5121B'
      ) AS t
      WHERE c.code = 'CINEMA' AND u.nickname = 'otbook_official'
      ORDER BY t.sort_order
    `);

    // 5. 각 영화 그룹 하위에 티켓 이미지 아이템 삽입
    await queryRunner.query(`
      INSERT INTO catalog_items (title, description, category_id, catalog_group_id, owner_id, status, image_url, thumbnail_url, color, is_public, like_count, view_count, created_at, updated_at)
      SELECT
        t.title, t.description,
        c.id,
        (SELECT id FROM catalog_groups WHERE name = t.group_name),
        u.id,
        'collected', t.image_url, t.image_url, t.color, 1, 0, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM categories c, users u
      JOIN (
        SELECT 'OGT No.1 스파이더맨: 파 프롬 홈' AS group_name, 'OGT No.1 티켓' AS title, '2019. 7. 4. 발행' AS description,
               'https://i.namu.wiki/i/EAF1Sj2VHp8Hbd_RX6nKD69eIpiI5gi6CrkAvGM6Wt--mmm9mRDYEKesQfSZ6psfmMat3fA8JBdCcAdIgPNNSzuYqXN2ve75j3yqLqqqD52ImxHCSiSIs-HsosIJqegri8sjQS1t6HiJliGIhLekkw.webp' AS image_url, '#EB0F0F' AS color
        UNION ALL SELECT 'OGT No.2 라이온 킹',                         'OGT No.2 티켓', '2019. 7. 19. 발행', 'https://i.namu.wiki/i/xaU6d1uIhgIX_k7xx4j9BNxk6E07FbdwwgE4LaEUPQN8mb6_FTgoDeFY2N-_DzvLq1T9JSSeLory0zTsSsbRFoEAiefzttU1D1UCR6WabeYrQW4CQ3NNRtp1IcJ8ysFVsEsZptqS7GY1Ysj0p2IfMQ.webp', '#EB5D0F'
        UNION ALL SELECT 'OGT No.3 나랏말싸미',                         'OGT No.3 티켓', '2019. 7. 24. 발행', 'https://i.namu.wiki/i/E7EQwU4ylKECHXgiTtP88xHe-PvjPsTOhX62sQzPADFwXvq3a7icueg_hgIPTInZUMP1QcjXEgvX1X7JPi-JbNqC9eaKmol5wfyRC0FoIC2buwRmx-xUSfoY736FULEJFToj47pFqq0Tp0DAllC7iw.webp', '#856F4C'
        UNION ALL SELECT 'OGT No.4 타짜: 원 아이드 잭',                 'OGT No.4 티켓', '2019. 9. 11. 발행', 'https://i.namu.wiki/i/oyptWZZ3Iw8yEgsPT925oVWERAeQPhZZD5inu9SDxN1Y_iKTNG3wEi317eBQZHHWeaxgxC83Lr_22LvWQSZKhSs3CsnR-1Jtxz-xqiLidKF3VKSwxQxGpS2l1d8auSJg3bYO6OmR90iqkNHTxo1Uog.webp', '#F2340F'
        UNION ALL SELECT 'OGT No.5 원스 어폰 어 타임... 인 할리우드',    'OGT No.5 티켓', '2019. 9. 25. 발행', 'https://i.namu.wiki/i/IBPR8G9Nqyddh3vvpi8ah2cVi8g3lXRpAtbXMMV5eoI-Uz73syL5axOcLYLqqnR3RK5Y7chr5PGABNPneUGiTRCxT9k426PrE6d_OpcdI6DYylD_RI13PKdEgmMBv5ovGhruM5IPao4puU8yQVb_Yg.webp', '#FB9800'
        UNION ALL SELECT 'OGT No.6 조커',                              'OGT No.6 티켓', '2019. 10. 2. 발행', 'https://i.namu.wiki/i/p9earc2m8wMs_r1UX_7nJ37c-bGUB6FZYr7BjxUT3-4D-l4RVl6Ofs6fx_0lACoa9lt4gSA9siFyOvBLbr629B0rQ2aoVQT4unFoOOmuWXSgSDZ8_Y44XJe4juTaNBtguj9B4uiwIbZGEIQ2epZAJw.webp', '#00905A'
        UNION ALL SELECT 'OGT No.7 말레피센트 2',                       'OGT No.7 티켓', '2019. 10. 17. 발행','https://i.namu.wiki/i/jTBmlFCTKJ1GxhDRd_4AM_0Q-xmX3VXHZd_U-63VSxLypaPTE5J2CScZX2Uf8XcRkdo2K_cNhXhjJmD3dXM8HyfzCKrXl10hYGdoKVz1yMQ5CmPDBONs_neiw6ObrP4FV5a28Um3w_Yyg78-t6hQBQ.webp', '#43A964'
        UNION ALL SELECT 'OGT No.8 날씨의 아이',                        'OGT No.8 티켓', '2019. 10. 30. 발행','https://i.namu.wiki/i/eJZUvm_uOIiUYRGWrR6anocVBPJP4yj92emUse_ErpbaNZdIBwBRZ7vh4AxSWBldOOg52mWmN8gaCE4VfCEllRTEpvrbn9wqbvHeAi82AlzV_Qv9oFCWWjfbLIyw3hl0yyulVahEnksCs9gGfNSXww.webp', '#00BFE7'
        UNION ALL SELECT 'OGT No.9 겨울왕국 2',                        'OGT No.9 티켓', '2019. 11. 21. 발행','https://i.namu.wiki/i/RLyOAKwShDbcA6iyy05deRdcr4kqeIMoAl6mCCnaXM-nCPtgJGR_rR-gjW6slwetoXew-mhXIyf1IDYO7r0ibMF4ktxONy-KJDEDaE6QTvKIPX_Ohhq3UOL4xpZsJUX1Emesu6OtBTOfQUG8qeKH_A.webp', '#0082E3'
        UNION ALL SELECT 'OGT No.10 포드 V 페라리',                     'OGT No.10 티켓','2019. 12. 4. 발행', 'https://i.namu.wiki/i/Plr28XnuBPn6uQAxcZU4xf_XfhkpjcfTjBknfV8nLMJiD4b6p2-niqjHveIM-HmF6Gn9xS0Y0v9QComrwQAojpj7XoQc9I9hbDCXjrVYwV22sEgSsCgV3U6naBTu7V_m4MiiO7Woz4Hvsyj7VCda9A.webp', '#EA071A'
        UNION ALL SELECT 'OGT No.11 캣츠',                             'OGT No.11 티켓','2019. 12. 24. 발행','https://i.namu.wiki/i/_g_pFMUajSpYjsUyL6ch52-ZZK5pvCZ_ypu2Rg6w9H4_1KjbVK-Ehwz0IoruSL6B7Jr4Y2e5CS0X18ZC6M1qnuOJevW96D9Ma69gLkN6JuSHmBohDZzqIwG05cb0zD_nCN30bm9JAO7awJybMMN-xw.webp', '#9F1CCC'
        UNION ALL SELECT 'OGT No.12 스타워즈: 라이즈 오브 스카이워커',    'OGT No.12 티켓','2020. 1. 8. 발행',  'https://i.namu.wiki/i/_a67RD1oIVnKEnZckeUfAfZJ-qavWPCA7JKn_1yW4ymNi_WyA6QzqIGfUFw-xW2IVby1IjwZ-lHJeKYRAdF312tYdBN0bC4Ict5Ytzn9_hmbF6H7xxhYjgsxW1VDWUDXXYi057KCDt4ltfhKVHoICw.webp', '#0083D0'
        UNION ALL SELECT 'OGT No.13 남산의 부장들',                   'OGT No.13 티켓','2020. 1. 22. 발행','https://i.namu.wiki/i/KyxogmBqfQZlX_Tz-AdlwL8uwd5VgW6BTu3WJKAKwJZz3_iLXu7JoEj9_P2_IdZUPnXzzim8BBlE-eN-3vN30mKm6AZHstkrTDGndNMCZKp8KzL3Rf3FB_bPQTNGWZbKAWcI3fdTjLKvHKaBoW7A_w.webp', '#514F4B'
        UNION ALL SELECT 'OGT No.14 버즈 오브 프레이',                'OGT No.14 티켓','2020. 2. 5. 발행', 'https://i.namu.wiki/i/xc19FHKr5FgUUXWDhZc0eMtj1F5ZzoTzkdO112O5Pp6i8Kuzsk41I2FS1w6W3-sQi-xalmoIGA_aFnY9sr98ajvg93rdfKxnfHEfHd54EOoasNGSCOpVwviq6Nhw-VfojDXzb3O-YCarNDpvrkyp3A.webp', '#FD426D'
        UNION ALL SELECT 'OGT No.15 지푸라기라도 잡고 싶은 짐승들',    'OGT No.15 티켓','2020. 2. 19. 발행','https://i.namu.wiki/i/5_O5OYLAn3tXK0vnlw39u-oUpHyG5Kt7VbfYbKHhiLvZW-vDs_3gC1mMWNANC6ukHh6ajwa7q5xUNZEArrPXbQPQ5dZI8SS7ep2amsQVKtBdlwTYh2rW2yjrvxJndSrI6P6AWbswS4ZvYgxhVPxU_A.webp', '#000000'
        UNION ALL SELECT 'OGT No.16 온워드: 단 하루의 기적',           'OGT No.16 티켓','2020. 6. 17. 발행','https://i.namu.wiki/i/sDyEZwyLF5nj4ICnmJVATx7Zl796khu501TSQ8cEDv3CkPQ3Wy0q3KuxDAg7n_jIBIk2x850xCW28w5vFTfRjgQ_qzg4bekNd_5hsTeNC-n38DRKM4eEZSCapyhu7oHwM0JPGc-C9Q1GNP1JvLv2vg.webp', '#2E00C9'
        UNION ALL SELECT 'OGT No.17 반도',                           'OGT No.17 티켓','2020. 7. 15. 발행','https://i.namu.wiki/i/xTk6xM4ck_pd6SXD5EduAXDHAirauEplBkOk5CDz-Zxt96VNekKPaqKCOoHSySfi7DxBXhcB4zW9gB6cNZn2UP29nf_YqSEfhKqXy8oVycCx0azw-ZpAKacZMujTTwypBUMxYHdOpyhO0GCULsmWTA.webp', '#895E0B'
        UNION ALL SELECT 'OGT No.18 다만 악에서 구하소서',             'OGT No.18 티켓','2020. 8. 5. 발행', 'https://i.namu.wiki/i/8IVcveujPqrbNtFXWrck5t68WlF-3Yl5HYKURqwOV5d8rTcpf0eWZ1cqSByDniYxKrG7st-h-lD_la4M6m1Ip5ruTL0D0th2uny9O2gvhBeTv8yTuIFm6gbPkU3n2DYK5mRJ3D_w_gYkT6Og7XW0hA.webp', '#6B550E'
        UNION ALL SELECT 'OGT No.19 테넷',                           'OGT No.19 티켓','2020. 8. 26. 발행','https://i.namu.wiki/i/5N7dFSkxMGUhIf_QvpdTpvSezptJzlFvPszg8pKZHI623cu70crlmEhr3eRdfb8UUgAjabQHxHOa8PDtedpIAVuyc3GLO_NonZouhl_PqoIk6LB833Ljbeico7F0Lo-gpvFreVyrmGBMfDPNrCzvdg.webp', '#146CA1'
        UNION ALL SELECT 'OGT No.20 뮬란',                           'OGT No.20 티켓','2020. 9. 17. 발행','https://i.namu.wiki/i/NicPu_UnGj0UnUMa_Ns6M8z377kG5FlwYkcqYWQ2dEbf3eA0Y5FrRc0XXCY9uYG3G6KkPwP5ETm_UENxUXvf3uRhE6nK-cSLNAqIcD7_YI5Hl8TE8cgXpgC_IozsWbp2Ww7Y2TI2pXqe6L07ontt4w.webp', '#900E00'
        UNION ALL SELECT 'OGT No.21 원더우먼 1984',                   'OGT No.21 티켓','2020. 12. 23. 발행','https://i.namu.wiki/i/1yZcS7Us1RgHlOomn4S6U4Qvoe37iliSuxzcKFvOjaFXtrX6A7M53mXTwcHe8480n43HoKjrDAwbiPgb5oZGAQ6Av3o-vCJxOQGgbsxq0NWTQ7X_79lv6dTucy6zIslnfw4Un1JlnR7uZYV-AQR1ww.webp', '#297618'
        UNION ALL SELECT 'OGT No.22 소울',                           'OGT No.22 티켓','2021. 1. 20. 발행','https://i.namu.wiki/i/Vr_EsxFKAug6sbtuHSZYq1QoOONPpiTSe7SM2lLmyObo2GOhK8x01SQTvHUeIBrDXOW7BO0uOYK0593BynhGNY3bd5v_Pd-wmvzwVcomh1udcWSie90EOetYPzj5rNf-ufbgynx9mL8vDW5P0GGz_g.webp', '#009CC9'
        UNION ALL SELECT 'OGT No.23 톰과 제리',                      'OGT No.23 티켓','2021. 2. 24. 발행','https://i.namu.wiki/i/7qYlBIqInWKfCubd-d576ahYZuNA6FiHaf8vOtzzU3kjpNRc2MefKdB8uYCAEic6ez2ujEhL4R86e-GkYzlXnVTE4iE4PF5KlgU0J_QjSbWmGcCMLyqSVK9v6-jYWw3kkQYiE8cL3RTf5uUy-yh6WA.webp', '#EAA900'
        UNION ALL SELECT 'OGT No.24 미나리',                         'OGT No.24 티켓','2021. 3. 3. 발행', 'https://i.namu.wiki/i/kjYxSYDj2vCf59gc7nFp7gHoCsHtmNGoyxY_UTORoDvbkc91X1QREXkNAyScqYde7F0WT5RLxZxPAZrJRg0l5LUMJJg8qSLeDUXWtXfkb41FlvzLqO3U3J6k70LszbADnmb1HrU5SDjWLcBuQAz6sA.webp', '#729A17'
        UNION ALL SELECT 'OGT No.25 자산어보',               'OGT No.25 티켓','2021. 3. 31. 발행','https://i.namu.wiki/i/JjtErkTozGsKPpFAY-qgBkwBOGU9QwhpgNECM5nIKdJJiQFRp-bxrMIZBMIcl2IX_sfa9WZUBxFXczp-ziQqBoh_RskxPkM7ShKy9pOzerq0M6TfWUbtljitdb6nMYS_ymmrb5hkxThaAj827Q-2LA.webp','#4B4B4B'
        UNION ALL SELECT 'OGT No.26 서복',                   'OGT No.26 티켓','2021. 4. 15. 발행','https://i.namu.wiki/i/raL0uYUjAYzAZ_sJcEZRsEZZ2F7MIEgWH3xp2fNsEKfHuqDpwh1ZNUIULFeuwbJxwCTEEoWJ34_r6phqo64PWyzKEbxlfBfzrUsJuAMRt92262dgM_cWtpjVKNCjvJToAjZbIzM5cFgVTUNs9mNSTw.webp','#02748C'
        UNION ALL SELECT 'OGT No.27 분노의 질주: 더 얼티메이트','OGT No.27 티켓','2021. 5. 19. 발행','https://i.namu.wiki/i/j-LjCE0ajOwAoDFuaNFqYAAvvgapdgErXoGOvg66L6QU_KPGwDxTrWDgRLbpCZV_oPtywm5zPENIciXlkPhxDrtn8lr6pCeFl-1-HwMsk2Uds6wLMP6VR2jo-6pv2vra2UU1hE6Rf-rit8ZmwVOkTA.webp','#375CAB'
        UNION ALL SELECT 'OGT No.28 크루엘라',               'OGT No.28 티켓','2021. 5. 26. 발행','https://i.namu.wiki/i/MmsVMUICU3JUlyyWkiLPrKZvewUc1RdYykPgSO-gASysywJxEfZKi3wlWjRtgjYg3zDEVl9rBjviQWYCqxkEGMZbYj86Zk29UUtjzx7ZDWYCrT7YWePDTw7idnREjGT7gHQu-kn8aYa1YKyP9USJrQ.webp','#E82B17'
        UNION ALL SELECT 'OGT No.29 루카',                   'OGT No.29 티켓','2021. 6. 17. 발행','https://i.namu.wiki/i/TgAGgeTfD152w0FzWEVShnScKK36t1-_lzIt5UtfX0ytemha1VbDYVpj-s9Gf9fglFzuEQiruBjWNsnA1rIWkUXUkmdueGzkIrAPS1gXk76DNAavNv9wD17-Dnv2IQKjoqkBX-qTlBQXtO_g9nytSQ.webp','#1BB9F6'
        UNION ALL SELECT 'OGT No.30 인 더 하이츠',           'OGT No.30 티켓','2021. 6. 30. 발행','https://i.namu.wiki/i/QpmtK6Jl_ipysz93R0c6nSb1AflV-PvE4CZl56YXHGRSnUZkSca1gpBhsKU59Q_pSxLK55MNfLMTCunBs_Zey9YfzbJSLkccNrzNInOHb83fU-zAhdnMoiiP4KvQSagfIIcqAIM8-6IcjD2qenS_1w.webp','#532C83'
        UNION ALL SELECT 'OGT No.31 블랙 위도우',            'OGT No.31 티켓','2021. 7. 14. 발행','https://i.namu.wiki/i/nCQPsmxBbHq9TKxP-T14psC_e-xLbnWbfjGy29Ya3V-V3ucxB8EBYu-iCY3Me4OJCCRK749DXleLiR59NLpJ2CBuqoCiizR9GXCUWw0P08VDUOG2I3YOz5kcfjiRi8TfmU4NreZLL4mmwA6-jLBINg.webp','#E90520'
        UNION ALL SELECT 'OGT No.32 정글 크루즈',            'OGT No.32 티켓','2021. 7. 28. 발행','https://i.namu.wiki/i/Zxoz9vp-iwX0ScusG_NIqnvYXJlxP3bjpSSfSyWoFMFy9YmhcCkMKqGhOYyOXGdeiswGolD7mjZcPYbSHHn9DD31n70zURmUTtfnjgaPqtQunPT2dqcHD-1f-GoKjOjjBixENYdOUKYDnit_W3kUnw.webp','#4BA924'
        UNION ALL SELECT 'OGT No.33 더 수어사이드 스쿼드',    'OGT No.33 티켓','2021. 8. 4. 발행', 'https://i.namu.wiki/i/Mhp7XZFYTJV_Y1Tt_ISMv6dN63t5P251iGxzJRtZWTCRbBbv-qdKUXFGvZlG82oUrjoB8pbBvQOYRYDqewXdOLr4B7LlIGMZZmcB6kWVQfNdJ7itLNh7XmCibHpnbiLC0kat01fLRHk2AABE7OG9jQ.webp','#1E57B6'
        UNION ALL SELECT 'OGT No.34 프리 가이',              'OGT No.34 티켓','2021. 8. 11. 발행','https://i.namu.wiki/i/DG9q9f2UYyC8K15z0CEuSeO8IJnKY14FWNbqToZGlG40hEnbCy4EQOx0RxwPWeHatlqbO7_Qk5ahuwqo3nLOS9Kf6JYmQJsmQfNIFysKnqpXsDv0Yjzk5TjWh0BQypaB-omHlIOVP-tBSmT__CdYwQ.webp','#3385BF'
        UNION ALL SELECT 'OGT No.35 샹치와 텐 링즈의 전설',  'OGT No.35 티켓','2021. 9. 1. 발행', 'https://i.namu.wiki/i/wa4WtiSsbNpIM4GQTCh8efhOgs5SWrO06GmVW6y38gbTaV8k4qwY2KhNAROSkhdA7q_Ihgpq-ISFPguLXXCJCvRUPx5yzje6hQR2Gn98OjbcyU7kZmcw6FKt7syu05muzVaehD3Xil9Mx3nNI4zF4w.webp','#BA3609'
        UNION ALL SELECT 'OGT No.36 007 노 타임 투 다이',    'OGT No.36 티켓','2021. 9. 29. 발행','https://i.namu.wiki/i/tneOL2gADK4e-tRekegsmXnnMDnw56r-sCqf_dh8x8c1fT7DqOdY5N62g3bKCfUWT3qchxaYSYHp7MNSyxez31wnulupuUS_VPsTINR7eVuvBX8IVO0Pt6X4hQ6NUmFiRGg-VUeBGLxFrHdIbP9muQ.webp','#D39214'
        UNION ALL SELECT 'OGT No.37 베놈 2: 렛 데어 비 카니지','OGT No.37 티켓','2021. 10. 13. 발행','https://i.namu.wiki/i/C9jn-LHeVIXUby4nOKh66C8GTxR9U0TwL3qW4R5VT0mUqxlxHV8f32bIl-kqgwOqOSYkUbOdONy9QgtecOB7TAFFvkKFHhgRVNAah-4X5h8Y1lIwedRaB1tYn4AxnE9r4ttRwAm5Pw1CK3pZwdSFpg.webp','#9A0100'
        UNION ALL SELECT 'OGT No.38 듄',                    'OGT No.38 티켓','2021. 10. 20. 발행','https://i.namu.wiki/i/J8RmCtorm27ylk6HtRlO_0KRF2ayuT3NKRdek4Vho4nGD6QL1Vqnf7HVrvHkR7q536WFpY3Rc0chLid6JlThkEJIkGF7vOUL1YNKeBw8zVi9sEQ3uaC4EUxqzk_f0yb5ZuUJAbar1VBZi7sdTlzOJQ.webp','#2D4B49'
        UNION ALL SELECT 'OGT No.39 고장난 론',              'OGT No.39 티켓','2021. 10. 27. 발행','https://i.namu.wiki/i/DHanKZLt41TrK2AVBrC9ghHY2vU5WFxvTsC392BjpGDj1QmxO85cOHQQPpVWHXp10oqkCkNFSIZ4pWniulXtB42hraP2mBKfXgHTSwyiYbyDs0J7gBexk3KJo-5MF3NYSHyqZLIMcNyBptosjNX--A.webp','#5790FF'
        UNION ALL SELECT 'OGT No.40 이터널스',               'OGT No.40 티켓','2021. 11. 10. 발행','https://i.namu.wiki/i/arAsJXuqHPZfgiAip-XLD9FRQT442vdMOoGR2tYFBV2X-Dn6xxOifSTgIXi3AANWwhaXyuC1i5nTM1PAFzYmsYybhCYYenSS041KwrJ15TGVe4_3Z3SoO4OWuhjk4OngLHb_otNUWqA_kIoSV5FfaQ.webp','#E8B663'
        UNION ALL SELECT 'OGT No.41 유체이탈자',             'OGT No.41 티켓','2021. 11. 24. 발행','https://i.namu.wiki/i/8wytMa-AgEcJq8Y3riFeAIMjBGpPYsmtvWTJzDY66gOf_lp4TylkIE1gus7IoMfZCGTnU7LNGqcIGowE-lpm49bC7xCaz0x6PT8LeK8Cn249hUDQahcKADj-vZHHd-h_gtoHhfy0PsrE07lG6q_pug.webp','#653C82'
        UNION ALL SELECT 'OGT No.42 리슨',                  'OGT No.42 티켓','2021. 12. 9. 발행', 'https://i.namu.wiki/i/xllropoC7ALbEtGwGsehHmklKkElGD0CMaau9Y_FwzD3-sESRuSYIxd9-OLoaoGGzQHeykOR1POQ_rmNHXAxfqRrQEdD8H7trl-Tjgmcat-mrpRvZPSmmzVNjaF8tJwAoi-GFCJWTVHkVhBoTHqMAw.webp','#FF7586'
        UNION ALL SELECT 'OGT No.43 스파이더맨: 노 웨이 홈', 'OGT No.43 티켓','2021. 12. 15. 발행','https://i.namu.wiki/i/p4uaSZ5LpXGPuhmMB85kVkx01gZeslilSmOaLklRuEJXu5JqinHNI4S-qEOomEhwEbPuk47TNgy8iW7TUwncJX4zULHY8ka1pwbmXgEy5aapyhhTzXDMsjB6nqFT18pettrb6Sm5JHxOV_g0Ya-X-Q.webp','#B11313'
        UNION ALL SELECT 'OGT No.44 킹스맨: 퍼스트 에이전트','OGT No.44 티켓','2021. 12. 22. 발행','https://i.namu.wiki/i/bEmzEYz4JxjQl8oCXX4J6IsxRse0ipNhmG7xdJmEeEEkZzPT9-y-EO0H6FrASaB3TO_F_flQs7vIzg7DjF-cO0K5UyZaUJSL8AW1TOsCeM6SXYK_QJo8ui2S3D6GnSFGkyCEegG-bCxGHo7fcRK2kA.webp','#FECB5F'
        UNION ALL SELECT 'OGT No.45 웨스트 사이드 스토리',   'OGT No.45 티켓','2022. 1. 12. 발행', 'https://i.namu.wiki/i/_JCcvYi1sLbMmAaqp5matjDHmxLojmsGRy_je8UEuI-oFrHkEouuVhLt8oCMkMGue8QcD4YHW6L42ykf0kTMImn1vz-5gCZpvjEkDhF4HlluhXh894sGsVdw0GY6uqdN1ZqekJJ-lXO0jEv0tSLHDw.webp','#BC000F'
        UNION ALL SELECT 'OGT No.46 킹메이커',               'OGT No.46 티켓','2022. 1. 26. 발행', 'https://i.namu.wiki/i/jZjBVua0sntq7RFou82xESWJr9t_DFOYna3TGxzXk1XDGel6Lc3FAmhh7YRFepK4IKtT_h8yD_6YTjLkEIX30iQ-QUJbHTt41Kzrydq5FY7InaQ879C9W4czAxETndXGPs4L_M9wXUYQFwk_5imh3g.webp','#76451C'
        UNION ALL SELECT 'OGT No.47 나일 강의 죽음',         'OGT No.47 티켓','2022. 2. 9. 발행',  'https://i.namu.wiki/i/og3qaqlNdiK7LvY37192i2wLPk0UVRBpjadEYckLzra8tiavK4_fs77caVzbn4sSAza3PR-Ij2sy-Dt34Gmq8Nw-92gz0xY1daB1Sld83Ydsacml5I_jRn2QEQKNAi2-cSmkRAcEsDbOvzo0fIpoYw.webp','#DA7036'
        UNION ALL SELECT 'OGT No.48 더 배트맨',              'OGT No.48 티켓','2022. 3. 1. 발행',  'https://i.namu.wiki/i/qmeiK7A9DIU68kV2F8ezfFxpMoomyH6QoSPLthIxwy0xzqxaGQWwwhHsl6XewNSsOETDUM7-WVjHZHWHxA0fASsIFzK2l6HQC5MtUqFmpAkJkqlLtN3v8nXnpPcTUMc5aSzpqjw6nyNBgqti-Q0dNw.webp','#FF0000'
        UNION ALL SELECT 'OGT No.49 모비우스',               'OGT No.49 티켓','2022. 3. 30. 발행','https://i.namu.wiki/i/ms0_3UveaZYZd5nFG6O-N0ArqU6iim3MsjJMsm5ZcVhJhwNxBfBUmM8CY7PuSiRBGeI2Z0ekTLKRbcWII26LHtlm00hjD8QPwaPe0gNRH0luVlMG5JP5ravajJWVmdDOdR5qbJmnpsWRydv4ancoCg.webp','#007D87'
        UNION ALL SELECT 'OGT No.50 신비한 동물들과 덤블도어의 비밀','OGT No.50 티켓','2022. 4. 13. 발행','https://i.namu.wiki/i/Ylovmx5wS6ZFrOLPTPNfSd2pDskR2PIINUyJ4cB_IFpTGUa-t8xGEYg9HlUwhvodvQ7oJvLuoIJiaGlWEzYnO7ol-kpjEbqLDuqePOZv6mBnhOteCXctLz-qYcDR4lFPlQkHvfYAfFIolmfnKoy9Pw.webp','#635B52'
        UNION ALL SELECT 'OGT No.51 닥터 스트레인지: 대혼돈의 멀티버스','OGT No.51 티켓','2022. 5. 11. 발행','https://i.namu.wiki/i/UgEFQUwreGSoq9vHiAx47NkgWgA22j9zdwnRraP-pNONUReKaeAVkN-tkq4T8QvFW4U_2mn7Lw2O4_psPs02y7UXrsFFNW7AzQm8hx91_chm9MF8L4i2mrXpms2oRAbG_QTz7CXModeixAohQ7mn0g.webp','#AA2828'
        UNION ALL SELECT 'OGT No.52 범죄도시 2',              'OGT No.52 티켓','2022. 5. 18. 발행','https://i.namu.wiki/i/eKZsBX3C2i3gDGWI-dXIGiKDCAYQI-dFlAncg8mVqujJ6Z1BY17FqW-tPWsrxC_-_7fhgqSwst3NKsJVNzj1C9q_ln0NX42GHIK9Y9t8tgxHtDTr7wL6_cFDIXikmlTD8pJeWQOaXQSfn2dlx6h4wQ.webp','#FAB914'
        UNION ALL SELECT 'OGT No.53 쥬라기 월드: 도미니언',   'OGT No.53 티켓','2022. 6. 1. 발행', 'https://i.namu.wiki/i/4-r8H-uggPmE_RksoopZjHUQVASpMWai7kzK9TJm0NOZrWReVJ6vm3F5vS51Bty4bQtYlWc_wXbq_0y83cJTnEboNsSXSFN7PIvcv5xFmgT2M2XQSRT4Ub8Hw_SMkd5JsIXbxlvqBeV9ZpgYLRJAkw.webp','#00375F'
        UNION ALL SELECT 'OGT No.54 버즈 라이트이어',          'OGT No.54 티켓','2022. 6. 15. 발행','https://i.namu.wiki/i/ZUfkwmLwIOA8krXLuV1sPLuz2gyJIAmjQCzeKQU2_Uqa7NFKdh8V5oKCdDkYqT_U8N5uYt2KH8UoJHs7D_Q3NONVXX9usyLf-XCRSLR792MuWVZvYEBBn88vXPaa5SypQPN-8JadRdpwPXiV7yVQfw.webp','#280F46'
        UNION ALL SELECT 'OGT No.55 탑건: 매버릭',            'OGT No.55 티켓','2022. 6. 25. 발행','https://i.namu.wiki/i/xDX9MwcbJuM6rbfc2wXGJcHntKY2enYPmbGQj950glYBdglVq7v1lEeAQAcJOs5LOKt2FN-WMT7ivliI-diatR_hZc9CLlnejdVuRtEzMrIMFlGxUEWSuZyd3OLtOoR5DoTSzzNAPsQocgXSMFiMuQ.webp','#AA7841'
        UNION ALL SELECT 'OGT No.56 헤어질 결심',             'OGT No.56 티켓','2022. 6. 29. 발행','https://i.namu.wiki/i/D7mTCefB11OaJSxa6y2745DKOEhXboL5myBajXuVByoBO04nD3wWRMZ2S8RA4-ofggyUOtdfQ29m4HUc_ZLEHqVfKHVel3jE4_tyVeZ-F5HS3eev2R5o1TC5IeP_mSr-EGWl_GxKgQL4qsZN0mXfAw.webp','#46462D'
        UNION ALL SELECT 'OGT No.57 토르: 러브 앤 썬더',       'OGT No.57 티켓','2022. 7. 13. 발행','https://i.namu.wiki/i/0YbEnWT1nOcCpwF6it2tF02bgE4II5ka3Q0BzpTmcq5BiMY-Ra7AU2ob2wLD_u0NOpqYu4suOzI6uGR38yIEZNzr80HTNr5fzWkRpeYSc8t1bwuJKz6B8fFSOIF9I7o-93p8_heENerbgsJIzHaWIg.webp','#1E5082'
        UNION ALL SELECT 'OGT No.58 미니언즈 2',               'OGT No.58 티켓','2022. 7. 20. 발행','https://i.namu.wiki/i/xrHFsCNbhNvX-DkIuZ6cXQHkTGtY0rfrf6YrDBtHjWOBHMBYDbqzgEc_jcprLC_tmm8nGtaLIAYq_cMJ-j-qzdS_zhDMVCNKRJm9xApIirfh9z4Ig45y1xfJ9szyG4S8HxMMPkQXkroLPrgsAeNVag.webp','#FAB914'
        UNION ALL SELECT 'OGT No.59 비상선언',                 'OGT No.59 티켓','2022. 8. 3. 발행', 'https://i.namu.wiki/i/lbSXK4A_2qAXsd80g4m4qeQQoqLEP0aZiJJPmoyYYFvx1viTupi1o9Shc4KVYyugxOjoQ5en0yI8v5ZzUs_UG1xdvm5Lcmp4PFSqTvMBMOK_ptbgr_rc5k4PQn0FpO9CnjSXdduBmYB4QcDXGn2MyA.webp','#41646E'
        UNION ALL SELECT 'OGT No.60 헌트',                    'OGT No.60 티켓','2022. 8. 10. 발행','https://i.namu.wiki/i/vnDk89UDAzk5yboAvW2vPFFyCVBI2JLN6gqdNl7sil_cv4-fglnq__47TnN2SZBWggSVLH6CqIenj1UsHGQiFPq3Gf4F7e7b4uLhAM8cBxhXkad6JhfAcZGOm3cuL3iLSUBRTJi4eDb86zhze2H46g.webp','#D23C00'
        UNION ALL SELECT 'OGT No.61 오펀: 천사의 탄생',        'OGT No.61 티켓','2022. 10. 12. 발행','https://i.namu.wiki/i/7Yw7svO3CQZQeQzyL2F6406xbh9oj8vPmvk9HkSz5nzjiNNWIo9oxX349LYkqi-5lED5hXLZYHg9QtV80pcp9DsyPmiDo4o9YI4lL_D4m1KCDcmYwr7HrtvBIE6_dIhfiNn6l-6v8GVOqMN-flw7xg.webp','#7E0709'
        UNION ALL SELECT 'OGT No.62 에브리씽 에브리웨어 올 앳 원스','OGT No.62 티켓','2022. 10. 15. 발행','https://i.namu.wiki/i/phEUalDogw2iGvLyaHQA9BT-6wH-3ABGamD4nw6zcpM5hgtgOakIL7Lk1KE3B89pkIyT2ZwKl-I0CYA5IxpMe7eccpa0WZ-P4nVnzF1vucIENyHaIwBgXsK7PG1VmJ95jouLqcP5rP8T3lTCH7gbqw.webp','#000000'
        UNION ALL SELECT 'OGT No.63 블랙 아담',               'OGT No.63 티켓','2022. 10. 19. 발행','https://i.namu.wiki/i/C-KExX9jXdln5yc9VmFofA1A_LRLfwps9y3nxMQhZZA9f4RZLqWOVjI1dLcQaZFbqbStRCRPet7_Y58H33Od3azLA4eJpMKAITNKwV3mL1dAyO2OC3p9nJ0wheu7zBvZXvNA_L8F5xxXlHDChHdtWw.webp','#F2B33D'
        UNION ALL SELECT 'OGT No.64 원피스 필름 레드',          'OGT No.64 티켓','2022. 11. 30. 발행','https://i.namu.wiki/i/44scDK6v8Wy10TZ8SchFb1CU5m0wPvE3YqLdZKlSIrFu0P3Va-arIUquaNMqJcJJQlbPt2o-LjmZKBSCL6KJ4Z0XluXAALzx-bNjN-JiZ1rG9NP7rqyX2flBUYO-xe5bfbu0pM5NvEsUI6CGZcpmNg.webp','#EA2024'
        UNION ALL SELECT 'OGT No.65 아바타: 물의 길',           'OGT No.65 티켓','2022. 12. 21. 발행','https://i.namu.wiki/i/osVDSYPybmtGJ9t7qzC2mgxsp77d8Cp9K0cQ9-aSAeM8KLiANkcN-pFGQrYTV-CvXQxjS6PFG-U-M9nETygxLQr83OB6W4f1axkr_y_18UbJFDAMopdZ7x0_0rgiTFEe-plDfpGfwe2zLlWt74Qykg.webp','#0067AE'
        UNION ALL SELECT 'OGT No.66 더 퍼스트 슬램덩크',        'OGT No.66 티켓','2023. 1. 4. 발행',   'https://i.namu.wiki/i/jv9hvF4sbbDaO3-zzckKB5klzRNY1DJt49TJQqq-Qo4CxUZKXZmewWvAJEfauAL5R2KUoQjBTuV-kKjx76gXi3nyNf9_NG2X1klR1IPI9nNARhLdWitkcA-horl0z0V9WZMB0PWL8jYvpPFF_TjvyQ.webp','#FA9906'
        UNION ALL SELECT 'OGT No.67 교섭',                    'OGT No.67 티켓','2023. 1. 18. 발행','https://i.namu.wiki/i/Vw_ELSr9aUPQjo4YYKGe_MNDWHNag05BCxWWmQ3ZpVub8QdyBEoZ5g0WiAFBTfv6Hyd733cdp9Ccj5vhVSgT7GcK3RbFfrzCBXcamx7LXMwrpOgOTOkA8KdJo7zWhC7ojpcJx6-uWoYYzCduK4hcMg.webp','#393126'
        UNION ALL SELECT 'OGT No.68 바빌론',                  'OGT No.68 티켓','2023. 2. 1. 발행',  'https://i.namu.wiki/i/IgbKyh61pSM0iW2N1JBzpB1a24mIFd-RrXHaeljVjpl8ISGnNMeiGbYJXqLqhYMnYLpCFuTibd5sRzM0EOVINger4H6tsNot_Evxrz5beKtm_IaawYVo8K_VW5VFtL_fT26DWYF3UQoCB7gifS3Skg.webp','#8B4513'
        UNION ALL SELECT 'OGT No.69 앤트맨과 와스프: 퀀텀매니아','OGT No.69 티켓','2023. 2. 15. 발행','https://i.namu.wiki/i/fRgKkoSu_HH6KwuIQoFokbYuly2DdjL45-piuhDAA2QEBAcgUWCZnSWNRQhEVqRKlkeWNAf5awKMhBXuOjymuzKaT9kncXhQ_Xzx-_i11Ab2la6JNPYai3iMoGyl7Yzx0vS0qKIUEjV8j1QbcDmdPQ.webp','#269EC1'
        UNION ALL SELECT 'OGT No.70 대외비',                  'OGT No.70 티켓','2023. 3. 1. 발행',  'https://i.namu.wiki/i/wDBiYxwWNb2YjPtnWx6lA71mtp7XTdn2j0REMGUG02jqj5zTmeMVSY7QwtFYTadhRMcvzsozrX7a3vEPlYNlcyOT9J6uo1W1Rq5y014MweN_IKaEb3LT4ZxEq-I-5fGDlUdNJ21H8UiaXlq8pMUXWw.webp','#B02D23'
        UNION ALL SELECT 'OGT No.71 스즈메의 문단속',          'OGT No.71 티켓','2023. 3. 8. 발행',  'https://i.namu.wiki/i/sbIBU0nR-vpLP-39H0JjtuHNI6ExBxXIZ2NtDWEbASK2Dv7X0bn3hHTbzDZzbi4M6KGgguFl6SBWerXQG0vCtEiQXjOi03tkCO23n-WdRj44Q-0HffZYEP4320-MGFCJ8GN90j5hK6YC0S3OOQJbvg.webp','#7CB8DC'
        UNION ALL SELECT 'OGT No.72 샤잠! 신들의 분노',        'OGT No.72 티켓','2023. 3. 15. 발행','https://i.namu.wiki/i/vIzNLcl26D6piccOIpqvc_fKKJPF_G7rjrh6jB21C9S_rBRMc4uBRT7Llb6yfKk12ZJiD1i3p5CJpgLdIgd1zq2rjbtQpyukx7sc_z53TOqFNPW0aWeAHigOo7JtPvls2SBjK3BLRDOlEAFS3bGmmg.webp','#FEEE96'
        UNION ALL SELECT 'OGT No.73 에어',                    'OGT No.73 티켓','2023. 4. 5. 발행',  'https://i.namu.wiki/i/s5pFW5WhX8VSZixEvz6f4PLql32eXmRK-xxk5AaOsujGcg2yDh55wL_bQfP_v82Gm_r3A2KmO3hkHs5z9EBugruT8oG0jqB6a1kV0DuHcP2e2QKPlRJRsjzKI-JQqcbEH6MrHVJhWh7duax83wf6BA.webp','#D20F1C'
        UNION ALL SELECT 'OGT No.74 존 윅 4',                 'OGT No.74 티켓','2023. 4. 12. 발행','https://i.namu.wiki/i/YpF9P0LN32JcJrymAFh0cDkE_CF8TeU7r-Q5Jy2qsfs17rf1h6_CPCD9-So9BZ2jL3Cfsmpj-Q1juqqyl8YRBSBHkwTckhLl-mH5YmRrFGiY0Ah8EWFxJu8vIsbcZYe67FzI1OXluiMEPkpvEcUTlQ.webp','#E66C29'
        UNION ALL SELECT 'OGT No.75 슈퍼 마리오 브라더스',     'OGT No.75 티켓','2023. 4. 26. 발행','https://i.namu.wiki/i/iScejtxFtMtEZIbGPI8q4I6ORTIdF_nmd_vvoV3yEVxIID5m6rh_csjSoL5BwaVBuIyLnLOvrfxhfNrWtJ2HScAn_NjjTgj7yLwrTc3sKrz_Ktx7GXYhxDTSZiXFN4faFu_rs20D1cbcGy3fSw109w.webp','#0238F4'
        UNION ALL SELECT 'OGT No.76 드림',                    'OGT No.76 티켓','2023. 4. 29. 발행','https://i.namu.wiki/i/csiGL62FREnfjFN_53sfH_8Uyl0VQERXlQba4Ix9PcaywiBFw3Y9XWaqgUdohz0unDLTk-NzmOFGj-qpflhotVlYYz0izfswsxc0G6thDD6s6EXko7MAH_pVco5jxmj2-tDOeyo4fqUaTh4McGxbCQ.webp','#0D552D'
        UNION ALL SELECT 'OGT No.77 가디언즈 오브 갤럭시: Volume 3','OGT No.77 티켓','2023. 5. 3. 발행','https://i.namu.wiki/i/8hCmNhLIVCH6PoJFB0aNkX5RJJ1KieJVxCAgd0blcs67RXJUNRpL0zgnkWzvjv6UO9Ojgrfa1JDPRxIrvJ9yW6SvzuCVCQhJaEEvEFxVQ1O3c0X7KQDbgzOVYcA2vPc0nInCi5Z-34gJjsYN-awX-g.webp','#FA6042'
        UNION ALL SELECT 'OGT No.78 슬픔의 삼각형',            'OGT No.78 티켓','2023. 5. 17. 발행','https://i.namu.wiki/i/TID7rx-wsEhi-fgR1yDLUZt027TLOQsYE23IOWXgLV4ambg2ztcnte12ZwO6yYnfX1HuznMwq0axFbv_L4oQC4nuKWGPGN2UE28So7piSdvNnE2jgDEb812tZ50IfDMz5Kb8mGgo38lxpCZpCsb1AA.webp','#3E7B98'
        UNION ALL SELECT 'OGT No.79 인어공주',                 'OGT No.79 티켓','2023. 5. 24. 발행','https://i.namu.wiki/i/XI_dKnfDAucvjhWhyRAa0F9g1JQp_PkWUXROGsLB5Ou1YEJyzq2MJHgGSPHeJ1eaH7AHZtZX_qKI_WF9f62GCW70dq0ntrLSreUIBE7W8CF7UAZgWa3STzBYDe-7XYptnSL4P8oymQCEPUDLhyVBcw.webp','#74BACE'
        UNION ALL SELECT 'OGT No.80 범죄도시 3',               'OGT No.80 티켓','2023. 5. 31. 발행','https://i.namu.wiki/i/5m8WbaSxEi49YolbscSonCNnuFIXX388v0jlBlWCxm2TSNY5PS6kX2Z7HS10vEb5ijFhKALgDu9CvNbTfnBCQM6PQa5w7CsQIthJyfJ8YXEoN1d9k3DKujz7ecykeg6DnyORPTlSTqVBkcozCmBo6A.webp','#FDB813'
        UNION ALL SELECT 'OGT No.81 플래시',                  'OGT No.81 티켓','2023. 6. 14. 발행','https://i.namu.wiki/i/FqjFlBdjqNQ5DWdjs4itO2BWfS3zIK57JG57j1vNrZYZKI-Ouy_IR8gWa9NarHmkjaoZZITms-4glAuP2KujJiZB5QnuvXDpQG0ffi-IWMGwZcACz22g9UVyX0TgonOv6ah9lpfdv5AXDASdn42G3A.webp','#BDAF82'
        UNION ALL SELECT 'OGT No.82 엘리멘탈',                 'OGT No.82 티켓','2023. 6. 21. 발행','https://i.namu.wiki/i/hhobKj1xB1gGgzpR4L4YrgVJJv3V6HAMVyxAt43lArK_wfnqAM6lhiJxmUOUjDSf9ksuROaLin2DL0m752GuoCAIitTKgtlLBhhSi-KPP65txj9x0lQ97B32HI2mHTgGed6M66MfS20SmQPVfHkYjQ.webp','#FEDE95'
        UNION ALL SELECT 'OGT No.83 보 이즈 어프레이드',        'OGT No.83 티켓','2023. 7. 5. 발행',  'https://i.namu.wiki/i/5piubdIbsCFwaJx-wR0mk0nkJdbw1rj1eRC-BWS_470fKFBjOHqR4hab9GsgmWVfjhlvT4l6--cPdREPzCN_DCEfb53StdGzWxqbkDELQTQ9afBAghJTJHc3Kf9wO0kBBEQ8COo0lZ2a-VS_wB7bzg.webp','#B29B8B'
        UNION ALL SELECT 'OGT No.84 바비',                    'OGT No.84 티켓','2023. 7. 19. 발행','https://i.namu.wiki/i/ESrGX2FMC1aqw3xnbXnDmmRgh5aUr0gvvYFAQDFMil48WzDYVDEO1aENOCfjrii_uHYz5xFhZQnKpVjBwRhA5Yu1JXR0Dq6-p7fgg_aTg1U9pBOY5uNByVZZDhM8fVPbiIh_HVp2l_EnArCJke8obQ.webp','#63D1F3'
        UNION ALL SELECT 'OGT No.85 밀수',                    'OGT No.85 티켓','2023. 7. 26. 발행','https://i.namu.wiki/i/p0yw25k78vtZ7n--R509HpPrwVXq8g4VKGIM78tI8UfUp1RuaA5qfAr7UOVUI6pHsdB04ROvCVL4xCM-w_NSAsSK-e9Pmc1WENdbatrONe1fZ3ZoBCjwv7exwFiIjaDjk5VCJCL5QCBJbSPBn6OsXA.webp','#F8E77F'
        UNION ALL SELECT 'OGT No.86 콘크리트 유토피아',        'OGT No.86 티켓','2023. 8. 9. 발행', 'https://i.namu.wiki/i/AJZG8IpHE7r3QFyxNFNXbWKwrBEfhmDvzEemkKnc08ltk3IgTSnkHFiX-wL9KMGCF7oyNHFrPQoDwXE_-3p7-5DFJEqrUUKKIPR4sezq3Hyb6qbKjRye-xgqPGJ_Ceaf0m5nbUgWEasR2greHHt9XA.webp','#9BA58A'
        UNION ALL SELECT 'OGT No.87 오펜하이머',               'OGT No.87 티켓','2023. 8. 15. 발행','https://i.namu.wiki/i/w6PVqXmNe0YpIxaRf4TQJwMa65FX6jBQTe_Y-uo9VATu4n7XE4FypS4tUfO-lU_HJ6q67jsgBG7WvYc-J-_R3HwDJP7uCsInU9WR38BUZHnaAoG1wjoJe8slbbldC3x5iPo1UI5Yblc7Pw7Eu7aKxA.webp','#FF6E39'
        UNION ALL SELECT 'OGT No.88 베니스 유령 살인사건',     'OGT No.88 티켓','2023. 9. 13. 발행','https://i.namu.wiki/i/-SmG0LMPl0EVqKI08nxXv8RCV_h6yYsSgjOxR4q05ouZ1NI1l8tQ6lBjyD86n1GxjkSpdLPDfJihlLMM0FHDEx9NcCZrKPLydk5vK2fBbyd4HeRRhE7lE6Q9xQ8RBKwUhRuSF_S6LkX464SQZH7afw.webp','#E67E2F'
        UNION ALL SELECT 'OGT No.89 크리에이터',               'OGT No.89 티켓','2023. 10. 4. 발행','https://i.namu.wiki/i/tv9m5y18z4y2B0qBHv4m-FweskkTsQ2o0NxSewwYYMseJR9EOtfGrY577b5h9HG-WGuWeTACi3ETLH0MiBWQQ3ZKenLvqRjN3ryXVky5DAT8k7nZbVehSsCmuohWgDiRzgKHfAereHUfbRxPV_R9bg.webp','#A8CFD6'
        UNION ALL SELECT 'OGT No.90 화란',                    'OGT No.90 티켓','2023. 10. 11. 발행','https://i.namu.wiki/i/ukSNJyedjUt84F-7tjT7Or4mhX7GvFLg_IVUUcMU6r5u6NP36si3aYNRY84QDadQVlmttBBLry9U6MVQC1fGjIm3MMUXFDqFk0jBH7ycNyMjg31OKXKTT3-lUz6D4iH_aUbWFe39Ne6i8pbsWve4qw.webp','#C63133'
        UNION ALL SELECT 'OGT No.91 블루 자이언트',            'OGT No.91 티켓','2023. 10. 18. 발행','https://i.namu.wiki/i/QXE6m4g-8t7DzmCvVAdvQOLXEL62QlNyJVesshr506KVXSlbjTwTbk0wDMec3ffkIZbKBZHVgfOrluzPHG2tn2JU7IPixYWQeTOfE-Wodb8MasfZmQjBhZUHu2zG9uSxEGTXyL87USp8IYFqTSdsag.webp','#0A2580'
        UNION ALL SELECT 'OGT No.92 그대들은 어떻게 살 것인가','OGT No.92 티켓','2023. 10. 25. 발행','https://i.namu.wiki/i/qUAwMQr1WSvdh-fx0DBLpja_w-HZV9ZySc-puFFweMICclkHYPqPQ7g-zaNvEgL6lSrcUaTQEYFhaM4KAB5fgNmV2ZOtjPoFviafO4on51wdwhyGb3PlqfQj3o2hSoT0UyvtzZ1RB7hU09CNR_lpNw.webp','#E10101'
        UNION ALL SELECT 'OGT No.93 더 마블스',                'OGT No.93 티켓','2023. 11. 8. 발행','https://i.namu.wiki/i/5Gs-ovWO-m9Y_S4DZKqt7ddGjodknFLrCsiMrdH8_oyNI1ZaOEtxRUb00i4kuEhBep9DmABX-KD7CB3fPM5_nRi8YCselYK-OdYDVgr_LOPq3mVnZCZVSADyfZCeX5u9edPhuNTSXYdfXdVOZi5xoQ.webp','#D0A362'
        UNION ALL SELECT 'OGT No.94 서울의 봄',                'OGT No.94 티켓','2023. 11. 22. 발행','https://i.namu.wiki/i/LTB5WXsQre8ime7vzB08choUYw1_czO0cZAKdVuR2rJUE8k3MFBLYnDUBavifBd5aWOj0nDrsmjKurGmAChfT4C_Obn3XfvJYu6fcqGf-bhvkSurJ8egHZqvmCa5lm_gqq7l5hpIi9Kb4oKsNVHGRA.webp','#C89A69'
        UNION ALL SELECT 'OGT No.95 아쿠아맨과 로스트 킹덤',   'OGT No.95 티켓','2023. 12. 20. 발행','https://i.namu.wiki/i/-WYU0Jj6-CqiXvZaqpcq5llZkXzmiP8Fdpq9DMzQGhKmMtuEvfa3ILbtVGpLOPYOmmXUjDN0kmYyCcnejAF0oDX-9wK9Aw-RcgBcKKxGFp25waAxzJY33MIrZy0ryDYI0fv98kucRkHyp0tvop28sA.webp','#8DB7CF'
        UNION ALL SELECT 'OGT No.96 노량: 죽음의 바다',        'OGT No.96 티켓','2023. 12. 23. 발행','https://i.namu.wiki/i/Z22bG5R-IhXL_jOY4nF5dDZZRDZGJovxOM2FMSrRbsKtH0DPQyTmyhLc46e-wmECBVCLpjDLy9U53d5TlSzdtVCRCvyDY0JoKTtmg9USpzU67OF8BkmiThu25TKw1WT_tKPOXmxNwOCQcBwynTnyrw.webp','#090E14'
        UNION ALL SELECT 'OGT No.97 류이치 사카모토: 오퍼스',   'OGT No.97 티켓','2023. 12. 30. 발행','https://i.namu.wiki/i/MbpE2NhxI4F9P9omZEgAR7zB3V7Pvty87gGW3VlReMa9yPofdDQYt0iQ0p6igUh0ydGgMqxozh2QZs2QTSeUoQ5qgnnN7hHp2ltrwqA_2VNIesDuhThWz1Ijw1DPEm6uZMHneyWPKWsWdP2ehHaLMw.webp','#808080'
        UNION ALL SELECT 'OGT No.98 위시',                    'OGT No.98 티켓', '2024. 1. 3. 발행', 'https://i.namu.wiki/i/8gu_1bdHtuxE4l19jTt9Jv5D8uBMnqsdYU2PZI_oGtVXppq9l7MvUzv8amVz9-oRAjl_vOGgHzqG4dh4Bvfj5latEuukaHDLikWgK_PwIhYuNVdsTG0xotEYNwFB8fq1E5rDV4Xu8p7kyVgGgjgzXg.webp','#6E5CBB'
        UNION ALL SELECT 'OGT No.99 도그맨',                  'OGT No.99 티켓', '2024. 1. 24. 발행','https://i.namu.wiki/i/KHceNmsg_Nzd039fw0hOXAB4WALcsgoBtWSUzTOOsU67totOcuqEBFG4TvTg3wna4HJfU8WkOg1-MphUOSh33U2dgXDwF-iokHLcP37U50_gOWcxZr2TWQE6Jq6o_SaenooMFpCKVqkQSr1Vgm4EBA.webp','#1E0D0E'
        UNION ALL SELECT 'OGT No.100 웡카',                   'OGT No.100 티켓','2024. 1. 31. 발행','https://i.namu.wiki/i/bc6OrpfceYKF1sIit8uojzl9RtjkgZal86hXGgNXB4EJ9TMWQyETsjGSry1vQZDxxypkCRsOxtiZoNKrXc3bK4nTq0A8I_KFbdbs7S0QjHQZ1lmrn2wNELcHNsp6f_1nevnVzOb6WSx6SZzWfeQ5pw.webp','#5B165B'
        UNION ALL SELECT 'OGT No.101 우견니',                 'OGT No.101 티켓','2024. 2. 14. 발행','https://i.namu.wiki/i/8bdHj6zMkT_2OSniClOm8cGgVm6XmyuK5MqN4jHmDk4fgE8Bkn0AjsFHpP1heghS7fSQ31R1T7fcYEh5YDtT5-yZhpE5hMFRvmcmegDEqT-yZxInDCKL2gQLpobsxVfFU_HJI31doIRrmU6PO5phJA.webp','#006AD3'
        UNION ALL SELECT 'OGT No.102 파묘',                   'OGT No.102 티켓','2024. 2. 22. 발행','https://i.namu.wiki/i/1rU_CICx-9GWUd7T6w0APi4dzc59m91oqcPa9BZb8_xZfxZ6ZIYIPvoot0BMds660mb5XfvrcHnrjh3W2DWxsE-rk98wrL_OmdTVElxoICueHvIAAA9qCw3ROU09wTBIRz-7ZBG974GfigSu5Ma_RA.webp','#472F27'
        UNION ALL SELECT 'OGT No.103 듄: 파트 2',             'OGT No.103 티켓','2024. 2. 28. 발행','https://i.namu.wiki/i/QWXugHrLwafgvrOOLBJvUnoII5kcHwfLcn-8m-rVjeiIwoNCXE61yyQ5kPeRe68DDn2oCeCYvvp7jNZAs7pLP9G99q4_cJPrZE9zpyXH6PdB5PV79Qb_e1ALat--YTGTkPh4gbyndPFeECyW-JFr6Q.webp','#8A4623'
        UNION ALL SELECT 'OGT No.104 가여운 것들',             'OGT No.104 티켓','2024. 3. 6. 발행', 'https://i.namu.wiki/i/F2uxzfgmvxKgTiarT5sIleq2A2MFAiIHsV07kyRIc0rGN5Ut27iDgBMYgdIw1YJkAdF9XzcifjK-lhJWoLmL7bmE46hNlJ4ZDzQIoP1s_IiAT_vpEjeYqBE21-1vHsyBMIhkPct8H3T6Da0Vz0SQAw.webp','#EA8223'
        UNION ALL SELECT 'OGT No.105 메이 디셈버',             'OGT No.105 티켓','2024. 3. 13. 발행','https://i.namu.wiki/i/jqRvnsQLxdhr2ZkwvX-haRz7kYP_rUo5HKZFzUxTk84cIi0OG1kPwRt-897xXPWoGCpovbDl7PGHkxP3Q6BCQa_G1BDhV8lEz8D9dQB5fVxjzVqyb-08XgbRQOVvEXXoEpdCfJTctgR2UPFtbgq8UA.webp','#E3B8A7'
        UNION ALL SELECT 'OGT No.106 극장판 스파이 패밀리 코드: 화이트','OGT No.106 티켓','2024. 3. 20. 발행','https://i.namu.wiki/i/3b0NybW-U1fXFUwStRvB239XLz0zn5C5l8a7i9mCO325OZdDmaOakXJSTSJQw-R5MlRCvqrPDiVtF17tf5aNiV21gv9vlR40JYEB0Ykqzo0B58h3MlYvRoJb_RISeaxp1O5RzsbDO50Ev8KZyRvXnA.webp','#599BE4'
        UNION ALL SELECT 'OGT No.107 쿵푸팬더 4',              'OGT No.107 티켓','2024. 4. 10. 발행','https://i.namu.wiki/i/Ajh86kvh4m62c5ZDnEetwokGPL3erJr4S8_rckUv2-lgWs90f2apSDFPNVWcev0GC9aiIJeUPVJihjZZhsTBhtzxATiWdIc4gRCPH6PQQjiCT3V88aK7nkYZDnCq36-TrWnxoAhnnlkp6-uLUB64YA.webp','#F7C69B'
        UNION ALL SELECT 'OGT No.108 골드핑거',                'OGT No.108 티켓','2024. 4. 13. 발행','https://i.namu.wiki/i/M0HdFsfWESdeA-JKT79wRD40tbxHKxRDQOtEfYqLwH_cmmEhuWlbEkMAaEfazJbJXXQl7TermziCCxbnuY1FhsSLOgJ1FT4ra6tg43Mjanb8w2t58GEirZm_VEUqvuW7jUmATRcJQ7aHVbTYSYqu4Q.webp','#FFD700'
        UNION ALL SELECT 'OGT No.109 범죄도시4',               'OGT No.109 티켓','2024. 4. 24. 발행','https://i.namu.wiki/i/EaVMdyPa1w_eysCO_SA5D7ywRVKNS1pu1Se-QziGKlh10RDwn687aF_RHWDjgC86jbqgTbaG7-4Ifq-O93ifYjvfAecQxIR035AyBIWVegfPCrtp2zTOoUFusMb-3gOJAiePyg9pY7kkUenU3tKhCQ.webp','#9F99A4'
        UNION ALL SELECT 'OGT No.110 퓨리오사: 매드맥스 사가', 'OGT No.110 티켓','2024. 5. 22. 발행','https://i.namu.wiki/i/I8nEVA7U_gEeSF5XRetPC7nV-93d0_reO_m-yOoY6zUsyp8G03Sl-SNbr0IyGCDmN58ACIoWol0QnoRnb96wpHCD5EiGWfGJNZTpvAi-ZHe-emR_HQIUbf9p7Dpk2wTr9SsnhEPcw_g3Ivzz5QVU9w.webp','#3196A2'
        UNION ALL SELECT 'OGT No.111 드림 시나리오',            'OGT No.111 티켓','2024. 5. 29. 발행','https://i.namu.wiki/i/8wy4jh-tQHMs-IxT3d-soAfcToHWQs0Nklfq-HmEnayzze7cMnbAa1sn3CRnPWt0LjNtqryLUCzbuRL_Ylisl_yXGIRLUSJaUEjneTlSXnWVqLUaZuNBRLYCpXlyd4fZaK7CqeGNZRtGLZTqeH_dsg.webp','#D1E317'
        UNION ALL SELECT 'OGT No.112 존 오브 인터레스트',       'OGT No.112 티켓','2024. 6. 5. 발행', 'https://i.namu.wiki/i/n9W8P1lj5FRRfvCpYQDP1QB8SlbA4rT4vzsU_fMuJ2flxZCm7XtJBF40w3mxygdQ29KnsrjlfQOtEISLe641sX-roGykwh22he2McaJjjCb3JL-92JvPrY19TVO3x2jU4yFK8G3H_5i63Nv4_4WqCw.webp','#090708'
        UNION ALL SELECT 'OGT No.113 인사이드 아웃 2',          'OGT No.113 티켓','2024. 6. 12. 발행','https://i.namu.wiki/i/YujAhrBj5tVwzYJW4J5CK37PPZVOLXOYxeio_KyMnx2ghPd4IrLkSYO1tjVDP5f7r63YyNek8J7S-AXCdgCUOv8d_ZcoN8NJi7NIiyx3JKZs7ZbYGMroiBTnxsS58UzxMEAaVe32DtqfbCFEPiJkog.webp','#4A239A'
        UNION ALL SELECT 'OGT No.114 콰이어트 플레이스: 첫째 날','OGT No.114 티켓','2024. 6. 26. 발행','https://i.namu.wiki/i/Wr8KQGILPskiNnupAJ5kpUfscCu361VGyJ389jwc71rMsp9WScGqnICdin8yNgBgocO1BNXiGq41R5YxpF0OWNIie-l5evJU4lsWD8eqPqEqduE3D64xe4H9tUikLwuJQNj_nua59IW1rYP2CDnJ5Q.webp','#131E38'
        UNION ALL SELECT 'OGT No.115 탈주',                    'OGT No.115 티켓','2024. 7. 3. 발행', 'https://i.namu.wiki/i/z9tGE0ceV0bGug9ZlVpty9ux3-OQysaHfy_2mCIzfmDN5GLJu3B0SzNJLizyKWXUenTeu_NuTzgYVMyc-sTqNoP3pH1228ry1QjnAR85kzqvN6NHV8B3RtKtahaztKCQ7Sw_FsZFY8bTtdKQW_JTig.webp','#CBCDCC'
        UNION ALL SELECT 'OGT No.116 우마무스메 프리티 더비 새로운 시대의 문','OGT No.116 티켓','2024. 7. 11. 발행','https://i.namu.wiki/i/2BflPKgNPxyzrJs24Qpbewi9gUGzFhPhOSYPusOQ8rUX_20Srn0vXt1_XDmbpN18cW4hSSGD1qgJb5siGebgnRikeTe9EISseHC_qDSufzsCbXyqhqi_S1Hd8bD48oUOcC5ShM5ySTSR07Rq2IxwXg.webp','#3F7708'
        UNION ALL SELECT 'OGT No.117 슈퍼배드 4',               'OGT No.117 티켓','2024. 7. 24. 발행','https://i.namu.wiki/i/S0G9im2h_KxzYdEEJweiJaIjWBEA8qMO0NsL7f1t0Lirehh9WYOkM6WNgbpFLX7C91J93Jq0JnQ2ZpclxEMOBH5Ec2WwvAtNfA21RBYXdWVYImobnZLgFLOBumaqoTLMZW3aa67zZu2BsAwxKBu1fw.webp','#2F3359'
        UNION ALL SELECT 'OGT No.118 리볼버',                   'OGT No.118 티켓','2024. 8. 7. 발행', 'https://i.namu.wiki/i/V07TYV3QnoV_ybiy4zlpG6M1nirGn_OmkRIUW-Mxo-cQH-IqEtovG3KoEhbw97arZ_DY3pSaXeO5zqyo4LnQ1sKPeUpBQB3G5MGnuj9o3d5SAeMg10FTQTvFRGbgY7nkKj8c3m6xVigsUQPfMFvXfg.webp','#0B0C0E'
        UNION ALL SELECT 'OGT No.119 에이리언: 로물루스',         'OGT No.119 티켓','2024. 8. 14. 발행','https://i.namu.wiki/i/fbaJaLacbbGfY8qemY02xsHNC0oqN4gT98qplYI8pi9lUojHfHs8CWlr0OEOy4U0VqzF8sCQm9WKaDQM0E3WI1rPzfbE7S_pk4zRjosR1wv7eesPEg978DKX2aGsC0KysWxY1pt_kim0OpRtQU99Jg.webp','#023833'
        UNION ALL SELECT 'OGT No.120 비틀쥬스 비틀쥬스',         'OGT No.120 티켓','2024. 9. 4. 발행', 'https://i.namu.wiki/i/otOpiQO0N1LrMrRKgzXzxuOUhRK5os6b6RghDf8sYW4R1JdNGy2P6iqxqPKHUGzvAU3jKIrJagZ-w9ciARsOlMiEtmasJdgIFhAbGDnhSP5RZw0cRntQ0IMqT5_zCbEm5uvVHDeHzOterkRXQhHPPQ.webp','#DDD4C5'
        UNION ALL SELECT 'OGT No.121 룩 백',                    'OGT No.121 티켓','2024. 9. 5. 발행', 'https://i.namu.wiki/i/d3--Mp4HShbLC2Adq7yVw-Vnwa8YeNvziduXcYc-WxgXBuVTNWQDeEQMI0eWHWwAxNFkmyWjy7F06VHbe7CgVhf4L70Z3OO7VwMdscjzPWy1m4ZYITQL84D9lfAbVnp4SlFa5XHDP7NbAq-StgGLlw.webp','#750B21'
        UNION ALL SELECT 'OGT No.122 대도시의 사랑법',           'OGT No.122 티켓','2024. 10. 1. 발행', 'https://i.namu.wiki/i/Asescd0ZqEfYO_a_xuIFkqPCVReWLCOz32l5_pNWCZMQhaOc86xbqb3r3EIhOHaaohltOMs_vUSZ5zOzaYI4hEk2LQqWsZhnK5RnTVcHdqlq8X1AR7rP5Xh7GvUEOX7pEGGce3sflPo8BUKPi2BBYQ.webp','#01155E'
        UNION ALL SELECT 'OGT No.123 조커: 폴리 아 되',         'OGT No.123 티켓','2024. 10. 4. 발행', 'https://i.namu.wiki/i/4K49knqaT3wz4AmyNlV_kmsljYcVKsG3i_Uv956YLpbNBYllBavwLkeDcVVBWnbBtLMCCMroCVFmFEeuv0k85aon2Ej0Aotvw9r7bvXwakQL9mXKweD7Pm8w4eK5oBg7UE4lhQQFJCdWaQit6JxnRA.webp','#161D30'
        UNION ALL SELECT 'OGT No.124 베놈: 라스트 댄스',         'OGT No.124 티켓','2024. 10. 23. 발행','https://i.namu.wiki/i/_u6eEWvqNz3-_nA0sv_DHRi8YxQwtacmyfDJp43Mv42KdAvQZHS4aRxykBfrZ6lBkR8nEc622UJ8AvH2RIyma9JRanegqHwzhsRq-LhMaYE_WTevW-tAczx6T9e6bgAugtvnsHeYcMlvzxHh6Hs_dw.webp','#0B0914'
        UNION ALL SELECT 'OGT No.125 청설',                     'OGT No.125 티켓','2024. 11. 6. 발행', 'https://i.namu.wiki/i/iVjhphnK3quXCyamK6vDuENhR5KplR8zfvK0DYlCnwuwj1G3BcbA79DJdaX8chFrNUxNEN-KSjLLFeef4HQlQoVSXw9fXwU47roXvoUzp3tEizp3MqsaC4khHglTRnF3JiOhkHtuMgZYm391Y7RjTA.webp','#0052B8'
        UNION ALL SELECT 'OGT No.126 위키드',                   'OGT No.126 티켓','2024. 11. 20. 발행','https://i.namu.wiki/i/kZ0XDxjbx0AqlA8IGHMgGaIx88UIvsw0AS9OqYbGJzNXIEayb4KxE4FCZlre5pYUSVGD1AOMoz3e6cf6jHcH43Vk2wAWsnT33tRRDOUV99AIJ11XlhWiIHn8ICGQInL4v-eN6Vus5lgsP-HDwZB58w.webp','#1F4923'
        UNION ALL SELECT 'OGT No.127 모아나 2',                 'OGT No.127 티켓','2024. 11. 27. 발행','https://i.namu.wiki/i/UCYLX0vLpHv3PQYUGabIATr-eeSLHbBAU7z-Jy89M0Bm6CoZ_5fXim0_lgPxSuba6erUZ6tBo92sF-rwpLrVydElTNZjutHAfNIqUG3kW-irSL3GmWOwsWDLAkfmGzc5fu2UeyCw5X9wlOVhb9KY9A.webp','#00CDDE'
        UNION ALL SELECT 'OGT No.128 무파사: 라이온 킹',         'OGT No.128 티켓','2024. 12. 18. 발행','https://i.namu.wiki/i/2doCuihohaTOku9s6PUWWL26NaVFhl6FQO56TtTQWoxiimsB5XaiY-Gj0q2xPWKlu1M7Ikl66hbWa4usph6hL8VvhuYIH8nmzpLgiZWLKlTp_3pmCK_1NDXnXS38vtjx3q2vZGptNFunR24xZuQ0Wg.webp','#FBCBB4'
        UNION ALL SELECT 'OGT No.129 보고타: 마지막 기회의 땅', 'OGT No.129 티켓','2024. 12. 31. 발행','https://i.namu.wiki/i/semafMu9pGllw8DkhBWe8wzVeAPck9m9gaxkhBaVv_uq3ILJoSFAc2gqwPH6C_rsiWBherFL4TZvydEFS1t_xECD5vIYrUgMqu6dW8NGimyI5EcRMij6lg4-gyjqk6GUXXkfRP5I8ugRdbOrJ3JomQ.webp','#E1AA57'
        UNION ALL SELECT 'OGT No.130 검은 수녀들',               'OGT No.130 티켓','2025. 1. 24. 발행', 'https://i.namu.wiki/i/MuPl3dNHctmBHYBgHBIhYwF3HhNGKDy0yp9uEtv3cU8ErQ3w5tpdcplwBoncd7tuJIjy9k9XY2zvorW1ShaoT_vMTCIRKQ7FRstf0Li_MnAKgy945nDRp92i-mCzvJ7Et2-ys8YKVATKNr8-8SAMuw.webp','#1B191C'
        UNION ALL SELECT 'OGT No.131 말할 수 없는 비밀',         'OGT No.131 티켓','2025. 1. 27. 발행', 'https://i.namu.wiki/i/A1b52LyGwa87m_hoXdIvtQLIRWXXmWPctSqYnyRxqYQsn-4kzFwm_RHTpHmG20qJodObwZ4Gw15xNAADGDSTZ8YH2ZlYxDvRqR6DsmSyAJoBlXhzVwlX0BjLo2vY4MoA3IFtPkzqtlMOP_oSevBlhQ.webp','#B6B2A6'
        UNION ALL SELECT 'OGT No.132 첫 번째 키스',             'OGT No.132 티켓','2025. 2. 26. 발행', 'https://i.namu.wiki/i/BwRBT78grZH72XceEL3BFvjaaWRjJpUO7AKxYZCbbnGZncvRpXocp7YS1GzFgEr6P9KoIVLwN2Ot5o_mrVdaSu8pC2wJadfer7j871Xl4FYe-3FNQNm-e1jfoNjKpXWLSDCTG863jDA3LZQyMiNGrw.webp','#8BA985'
        UNION ALL SELECT 'OGT No.133 미키 17',                  'OGT No.133 티켓','2025. 2. 28. 발행','https://i.namu.wiki/i/ikDR1N577AhTYx2uNXgVcOlAsBbU8omoU2JrMNKwZbjMVUGWfimSgB9DoW37Hq-SNukHgSfwKXLkkAd-pRiJMdLNerX3xlCJjFqMG7nBaUCkwxVZpxwKrP43B4KifPmN78X-12ac7LP6of3sy5eNGw.webp','#F2A50B'
        UNION ALL SELECT 'OGT No.134 극장판 진격의 거인 완결편 더 라스트 어택','OGT No.134 티켓','2025. 3. 13. 발행','https://i.namu.wiki/i/DT44_fYEsvpE-2gv-tPESWM2vEu0JAg2ufkdOkppJEmcoIbFrLUQDZTobEdfuhIhrTdJZB-KddVEpkJXA0bu3cyY9sDXsMK1BDYuaC_bm7G_jiWxffcAEz1KRNvmzFmooBn1psp7xKnOAbbrlCak6A.webp','#F0C1A7'
        UNION ALL SELECT 'OGT No.135 플로우',                   'OGT No.135 티켓','2025. 3. 19. 발행','https://i.namu.wiki/i/zvJ4tVVbZ4JqAUWykjJ9TZhERFOK9zzxBHEPDmsgt87uoR_NFNwLMqzdN6TZwFOELIpGjNi73I_k_GoBE5g7Jmk_3iHQ5J5Vr0QIg9Hxr3SXxBpCfXLyDAe1qflqkOARHNYJk3LYTfqMt8Fhz1mUJA.webp','#9A9B57'
        UNION ALL SELECT 'OGT No.136 기동전사 건담 지쿠악스 비기닝','OGT No.136 티켓','2025. 4. 10. 발행','https://i.namu.wiki/i/spG2SfSgKFMXo_2WYH69OuzWQS2A4gdZM9BdWoYYsAdcQrj2pon_X79F_7WLcob2aRQkf_PaGULosUMn21HCV597i7NFuEXWFkoAFFOxhIVdWWrxcEosegvAIHW7xKm2gFNT3Gjd_ee79da_EGgcwQ.webp','#FFFFFF'
        UNION ALL SELECT 'OGT No.137 야당',                     'OGT No.137 티켓','2025. 4. 16. 발행','https://i.namu.wiki/i/pci1d6VxX0QMq683m55zsgw5DrD2bq3bT0RVF930XKTFZtPuQOO9uzC2M6x8uDRVYjkpbkRAnIRHCXvdVfhOp5lNDIl2ebPn2vevOpBGgxTEm0-FJisZV9RwHjFx32aj6BwTQCdADLEJOnOsc2bOLA.webp','#FF2D22'
        UNION ALL SELECT 'OGT No.138 괴수 8호: 미션 리컨',       'OGT No.138 티켓','2025. 5. 7. 발행', 'https://i.namu.wiki/i/5WXOtty1NiTbpJtNyHbkWCZ6P9CvR0PGrSJQvMxqnSFZ0upuW1HswJWkwAgfblq_if5VFmtBr0ug3f0MYp4F_TEHB_Yr4f-VagZYmpn5nJ97wgIQ6HXXQ1Tzu-06tiKRpkPC7vTWyj13LOpjBnUYhg.webp','#000000'
        UNION ALL SELECT 'OGT No.139 미션 임파서블: 파이널 레코닝','OGT No.139 티켓','2025. 5. 17. 발행','https://i.namu.wiki/i/lgi09Fib7BKpA5y9HyGAsceRu3S5YuRV4MkJJj9jHqXr9hBGqktEwnSRGi2QOpgQEbFtIjmRK5FQYwB5a24HDIPCKdl-FN7K15nsuOhlkrzcIH6cunpRY5gRV454weOculXC6x5FkINeLLkRe-tiKw.webp','#1D1D1F'
        UNION ALL SELECT 'OGT No.140 극장판 프로젝트 세카이 부서진 세카이와 전해지지 않는 미쿠의 노래','OGT No.140 티켓','2025. 5. 29. 발행','https://i.namu.wiki/i/KGZQkpxywXo6XdfA4Gg4Sh3LIPjbuoJtNXkVWqQ_mOgKMGuUtVyY0d0I8i2tq9095r9cqB5_gUJFKICcUIFszS-gG_qgBLvWPQzHWZGmB8f4ISBUjQrvQCveq0T2DZ7T0kj2hhfUk8KYjE8kd_2e_A.webp','#0184DC'
        UNION ALL SELECT 'OGT No.141 드래곤 길들이기',            'OGT No.141 티켓','2025. 6. 6. 발행', 'https://i.namu.wiki/i/KH5tF-uXNGwbkyJL3nC1ZQ66vryV4_M6uSrz3CD2X1wCsa3Am7-R4DmeXddcfuTJcZGOD77l3VrtIC-UC0wu0j5kcyNT_BmjQ9A1d7I5EZpNPRhYGL8KiQK8rwfMuguVFmYMqil6LhCptn_N6h9SRQ.webp','#B5ADA3'
        UNION ALL SELECT 'OGT No.142 쥬라기 월드: 새로운 시작',   'OGT No.142 티켓','2025. 7. 2. 발행', 'https://i.namu.wiki/i/iWoZmTv60d7qdcRWcDgmouBhI7vX66zBzhTDGjAPdeYgoxSJKr6tf2EY9GAYMDX5lTJJLohdo-HR6QK3dJxJDuOgkWF-lgqu7GcrmRwv0HfvivcLxHo6CaPh0YC4gRoIEjza1RSrLXzDBrrbV84uTQ.webp','#320B0C'
        UNION ALL SELECT 'OGT No.143 슈퍼맨',                   'OGT No.143 티켓','2025. 7. 9. 발행', 'https://i.namu.wiki/i/D3qBWVXBEG8L6O5UmkI3ZJhBIlKo-eaB8Uj3mz0Ds4HO8lg3rXEznaoojE3weFZ5i7Il3lZj_UAVuReLMBb3McMT-GgM54fY5IRFv7HMfQcWXAesGk6UBZW1r1HYWYnw6dxTOtj6Un0LtFuXrrP_UQ.webp','#CF331A'
        UNION ALL SELECT 'OGT No.144 좀비딸',                   'OGT No.144 티켓','2025. 7. 30. 발행','https://i.namu.wiki/i/SVsO41A1bKpxQgeLPNUzsEfoy6NzwtW7cZIuYAzpd81EP7gkVTop8hqIA0UMfoGGej0n9CrR1gznUnn7AQIMCbpj6pRh94cBny_hZo1TZSS44jrDEQegEJB8Spd0pr-dlSZRT_kjTlk1uTlVvaE9sg.webp','#29769F'
        UNION ALL SELECT 'OGT No.145 발레리나',                  'OGT No.145 티켓','2025. 8. 6. 발행',  'https://i.namu.wiki/i/pmMlitV0xtI7CKbTVXKN65_xbO4KiWJmlAaGKU4i5nDpH0d_fMviU92V_X8qCoAHUAw66sVZ4PG6q5l69lL0F7R0WB6ZXZQa3vfpGdIPIzDXeQ4AemnoSkWtOfFvZ1vWUo1NC7RZysmcqbcK2JTbzQ.webp','#043AC0'
        UNION ALL SELECT 'OGT No.146 극장판 귀멸의 칼날: 무한성편','OGT No.146 티켓','2025. 8. 25. 발행','https://i.namu.wiki/i/JctwJIKU_Yz4DxRaedd47acTKACFxIMr46f84_rfX0wim03Udj3rlB7VRrBZhvsSPjai4h7bqpFhOP3nseqja7B5VWEXULdyyfA7mmhFd758oUG8MCkANKtJJrMRxnR5SkKbLWAC27vz62z0-xxlYw.webp','#EE811C'
        UNION ALL SELECT 'OGT No.147 얼굴',                     'OGT No.147 티켓','2025. 9. 12. 발행','https://i.namu.wiki/i/O6Nq7es8V6E0Uk8IJHCKJpvpiOvYmFGt60DzoyCZvj1DwrkTrQZFvmvtgs9WMX-iiETJvY4mMOQx9dzeY8oVYsde2IfnRRD5HWSAZeRFF50aCcGG1vEBEsJnrGRNqBUSu6YhyHej7VS0xu5QyaRDPg.webp','#D9A48D'
        UNION ALL SELECT 'OGT No.148 극장판 체인소 맨: 레제편',  'OGT No.148 티켓','2025. 9. 24. 발행','https://i.namu.wiki/i/Jal4Osb0UHybOMGpI8CZF1-SMFpyM3pijrYBCkhBNxGQkF_CqsXM8-958QkP6qXCHnq0XtsngCI1_gBXH6_YNVzbrGnfFBWV6XNCHIi0uBLRqhv2Lo5FkLD6rSRAP4EkNbLbYiOVmvD3TDV_QYuVPg.webp','#231C29'
        UNION ALL SELECT 'OGT No.149 어쩔수가없다',              'OGT No.149 티켓','2025. 10. 1. 발행','https://i.namu.wiki/i/RR8mXoeWtIU--sKSXZ3JYdabn9575YPD0PH6YgvccJF1MhrUpxxpVeIWJ3oT5PLmABNMWt33ha-EwJZERZNms7nKZ97daUTQSUQ5IsyIzok2T2ZD51lFKQwKzUQ0Ac_WNARdLmDYAmlPju87kfDLlg.webp','#FFFFFF'
        UNION ALL SELECT 'OGT No.150 극장판 주술회전: 회옥·옥절','OGT No.150 티켓','2025. 10. 16. 발행','https://i.namu.wiki/i/wCEEu0AteqccTXuXIjFSK3Lzke5NhNXt5lvdfSq9Iv5tJb4O8eMnw2o9fF9Kq0BGJrNBfkSAuhwS72BYqyGp6YH13RpRmFzJ9AaKKNvGGHhVWkv_TFJuz5WYiaX5MVfB6AZi9yZ8t5tOr-SuVpw3SA.webp','#0161C3'
        UNION ALL SELECT 'OGT No.151 8번 출구',                 'OGT No.151 티켓','2025. 10. 22. 발행','https://i.namu.wiki/i/wa3IfkL41CRvXrV4xSKqUANzTD2Q3dc2Sv37W_YY9EnyPrWe_wNpHRsMxowfrcznGlk0sfpP2yX64rU4ul227A.mp4','#FDBF00'
        UNION ALL SELECT 'OGT No.152 베이비걸',                 'OGT No.152 티켓','2025. 10. 29. 발행','https://i.namu.wiki/i/1ndsBRx4NAltc6A9jXMg6u2D0qPxGIXxvCHEP7LDluzfPENDTW05TRi3wOBb6nxWJEPvTmganDu6lBKouqCuSymVyqB18y9QCz4drCdAD_pG76kJAdAOptB_7hpEEbremvhEl_E5lsgwpXGq9oNogg.webp','#DADADA'
        UNION ALL SELECT 'OGT No.153 프레데터: 죽음의 땅',      'OGT No.153 티켓','2025. 11. 5. 발행', 'https://i.namu.wiki/i/fniesh6RLjE67BjqKO-KaseJsdp7XPKxUFF7cJlR-RMfbFOvPbaEHfomPIiI66-UEwW_OK0ZBcaqQhFmBKkRa9CObenuViY_cQetV6dP36FViCI1AtsUXmWJNgs9ZDrHpmi249IAYvuKM1fRHUvcSA.webp','#011031'
        UNION ALL SELECT 'OGT No.154 나우 유 씨 미 3',          'OGT No.154 티켓','2025. 11. 15. 발행','https://i.namu.wiki/i/bLLOdjR_tz6r7T0vXnZ8wUAhUaCCIU1zMzyFAvjEgwZxOHijINsNWwjl8vLUo0bapsrEwAS5m4s9KQ2nJRuT1KI3odyJ3R5HHe_5ngPAqETy4R_PfT7p_JOYOWASiMEgxdpfwfWMcFIm9nLI7-4L4g.webp','#171C31'
        UNION ALL SELECT 'OGT No.155 위키드: 포 굿',            'OGT No.155 티켓','2025. 11. 19. 발행','https://i.namu.wiki/i/SWjiDOfO6YFteA02ILOn0-tCQjfMXdZPQlCHdamekELZ0dIiOHSnQyF8pc2gnmVoHGqbm44T_vl5JHtWNaDjtYsCBK7FX2ZEaCjheEEyS9jUwWIA_2LKXEgnC1OeXlO2hKd1GDKGmMUFStVakPWlJg.webp','#487609'
        UNION ALL SELECT 'OGT No.156 국보',                     'OGT No.156 티켓','2025. 11. 21. 발행','https://i.namu.wiki/i/md1DYYV8Iv5MarGxqGAR5FvdnbyvNguB-_UaTY6StRoJ08UEfH24qiq5CAVzS2F8zoRIAgYl7F83E6sFmKVV_fJDhsTjIs2pYqwH_1eytxngt1al0WPqKp5T8ckyQx2vKsd4SV3O7aN7TeuP3OmV1w.webp','#F5121B'
      ) AS t
      WHERE c.code = 'CINEMA' AND u.nickname = 'otbook_official'
    `);
    // 6. 각 그룹 thumbnail_url 업데이트
    await queryRunner.query(`
      UPDATE catalog_groups SET thumbnail_url = (
        SELECT ci.image_url FROM catalog_items ci WHERE ci.catalog_group_id = catalog_groups.id LIMIT 1
      ) WHERE parent_group_id = (SELECT id FROM catalog_groups WHERE name = '오리지널 티켓')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // items 삭제
    await queryRunner.query(`
      DELETE FROM catalog_items
      WHERE catalog_group_id IN (
        SELECT id FROM catalog_groups WHERE parent_group_id IN (
          SELECT id FROM catalog_groups WHERE name = '오리지널 티켓'
        )
      )
    `);
    // 하위 그룹 삭제
    await queryRunner.query(`
      DELETE FROM catalog_groups WHERE parent_group_id IN (
        SELECT id FROM catalog_groups WHERE name = '오리지널 티켓'
      )
    `);
    // 최상위 그룹 삭제
    await queryRunner.query(`DELETE FROM catalog_groups WHERE name = '오리지널 티켓'`);
    // 인덱스 & 컬럼은 SQLite가 DROP COLUMN 미지원이라 테이블 재생성 필요 시 InitialSchema revert
    await queryRunner.query(`DROP INDEX IF EXISTS idx_catalog_groups_parent`);
    // 6. 각 그룹 thumbnail_url 업데이트
    await queryRunner.query(`
      UPDATE catalog_groups SET thumbnail_url = (
        SELECT ci.image_url FROM catalog_items ci WHERE ci.catalog_group_id = catalog_groups.id LIMIT 1
      ) WHERE parent_group_id = (SELECT id FROM catalog_groups WHERE name = '오리지널 티켓')
    `);
  }
}
