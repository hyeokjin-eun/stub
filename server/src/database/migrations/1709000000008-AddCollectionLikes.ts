import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCollectionLikes1709000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS collection_likes (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
        created_at    DATETIME DEFAULT (datetime('now')),
        UNIQUE (user_id, collection_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_cl_user ON collection_likes(user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_cl_col  ON collection_likes(collection_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS collection_likes;`);
  }
}
