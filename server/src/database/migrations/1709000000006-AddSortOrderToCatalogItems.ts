import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSortOrderToCatalogItems1709000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // sort_order 컬럼 추가
    await queryRunner.query(`ALTER TABLE catalog_items ADD COLUMN sort_order INTEGER DEFAULT 0`);

    // OGT 아이템 title에서 번호 추출하여 sort_order 업데이트
    // title 형식: 'OGT No.{번호} 티켓'
    await queryRunner.query(`
      UPDATE catalog_items
      SET sort_order = CAST(SUBSTR(title, 8, INSTR(SUBSTR(title, 8), ' ') - 1) AS INTEGER)
      WHERE title LIKE 'OGT No.%'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // SQLite는 DROP COLUMN 미지원 → 테이블 재생성으로 롤백
    await queryRunner.query(`
      CREATE TABLE catalog_items_backup AS
      SELECT id, title, description, category_id, catalog_group_id, owner_id,
             status, image_url, thumbnail_url, color, icon, is_public,
             like_count, view_count, created_at, updated_at
      FROM catalog_items
    `);
    await queryRunner.query(`DROP TABLE catalog_items`);
    await queryRunner.query(`ALTER TABLE catalog_items_backup RENAME TO catalog_items`);
  }
}
