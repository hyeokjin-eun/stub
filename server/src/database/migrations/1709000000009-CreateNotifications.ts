import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotifications1709000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL,
        actor_id   INTEGER,
        type       VARCHAR NOT NULL,
        message    TEXT NOT NULL,
        target_url VARCHAR,
        is_read    BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
        FOREIGN KEY (actor_id) REFERENCES users(id)  ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id  ON notifications(user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_is_read   ON notifications(is_read)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notifications`);
  }
}
