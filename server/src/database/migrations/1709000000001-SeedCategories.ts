import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCategories1709000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO categories (code, name, icon, color) VALUES
        ('MUSIC', '음악', 'music', 'purple'),
        ('SPORTS', '스포츠', 'sports', 'blue'),
        ('THEATER', '연극/뮤지컬', 'theater', 'red'),
        ('EXHIBITION', '전시', 'exhibition', 'green'),
        ('CINEMA', '영화', 'cinema', 'orange'),
        ('FESTIVAL', '페스티벌', 'festival', 'pink')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM categories`);
  }
}
