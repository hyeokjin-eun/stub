import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBanners1709000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create banners table
    await queryRunner.query(`
      CREATE TABLE banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT,
        tag TEXT,
        image_url TEXT NOT NULL,
        link_url TEXT,
        background_color TEXT DEFAULT '#1a0030',
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        start_date DATETIME,
        end_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_banners_active ON banners(is_active)`);
    await queryRunner.query(`CREATE INDEX idx_banners_order ON banners(order_index)`);

    // Insert sample banners
    await queryRunner.query(`
      INSERT INTO banners (title, subtitle, tag, image_url, link_url, background_color, order_index, is_active) VALUES
        ('BTS 월드투어\n2024 오리지널', '서울 잠실주경기장 · 1,240명 소장 중', '★ 이번 주 HOT', '/uploads/images/banner/banner1.jpg', '/catalog/1', '#1a0030', 1, 1),
        ('2002 FIFA\n월드컵 티켓', '역사적인 그 순간 · 874명 소장 중', '⚡ 스포츠 컬렉션', '/uploads/images/banner/banner2.jpg', '/catalog/2', '#200000', 2, 1),
        ('오페라의 유령\n25주년 공연', '블루스퀘어 인터파크홀 · 312명 소장', 'NEW 신규 등록', '/uploads/images/banner/banner3.jpg', '/catalog/3', '#001a1a', 3, 1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_banners_order`);
    await queryRunner.query(`DROP INDEX idx_banners_active`);
    await queryRunner.query(`DROP TABLE banners`);
  }
}
