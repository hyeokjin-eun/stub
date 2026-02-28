import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRole1709000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // role 컬럼 추가
    await queryRunner.query(`ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER'`);

    // .env의 ADMIN_EMAIL 계정을 ADMIN으로 승격
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await queryRunner.query(
        `UPDATE users SET role = 'ADMIN' WHERE email = ?`,
        [adminEmail],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // SQLite는 컬럼 DROP 미지원 → 테이블 재생성
    await queryRunner.query(`ALTER TABLE users RENAME TO users_old`);
    await queryRunner.query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        nickname VARCHAR(100) UNIQUE NOT NULL,
        bio TEXT,
        avatar_url VARCHAR(500),
        phone VARCHAR(20),
        birth_date DATE,
        onboarding_completed BOOLEAN NOT NULL DEFAULT 0,
        oauth_provider VARCHAR(50),
        oauth_id VARCHAR(255),
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(`
      INSERT INTO users SELECT id,email,password_hash,nickname,bio,avatar_url,phone,birth_date,
        onboarding_completed,oauth_provider,oauth_id,created_at,updated_at FROM users_old
    `);
    await queryRunner.query(`DROP TABLE users_old`);
  }
}
