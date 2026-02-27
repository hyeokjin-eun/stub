import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserOnboardingFields1709000000007
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    `);

    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN birth_date DATE;
    `);

    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN onboarding_completed;
    `);

    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN birth_date;
    `);

    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN phone;
    `);
  }
}
