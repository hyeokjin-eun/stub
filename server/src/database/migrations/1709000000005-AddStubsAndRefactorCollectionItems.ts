import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStubsAndRefactorCollectionItems1709000000005
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. stubs 테이블 생성
    // 유저가 실제로 보유한 실물 티켓 기록
    await queryRunner.query(`
      CREATE TABLE stubs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        catalog_item_id INTEGER,
        image_url VARCHAR(500),
        status VARCHAR(20) DEFAULT 'collected',
        condition VARCHAR(20),
        notes TEXT,
        acquired_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_stubs_user ON stubs(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_stubs_catalog_item ON stubs(catalog_item_id)`);
    await queryRunner.query(`CREATE INDEX idx_stubs_status ON stubs(status)`);

    // 2. collection_items 테이블 재구성
    // item_id(catalog_items 참조) → catalog_item_id + stub_id(nullable) 구조로 변경
    await queryRunner.query(`ALTER TABLE collection_items RENAME TO collection_items_old`);

    await queryRunner.query(`
      CREATE TABLE collection_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER NOT NULL,
        catalog_item_id INTEGER NOT NULL,
        stub_id INTEGER,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(collection_id, catalog_item_id),
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE CASCADE,
        FOREIGN KEY (stub_id) REFERENCES stubs(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_collection_items_catalog_item ON collection_items(catalog_item_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_collection_items_stub ON collection_items(stub_id)`);

    // 기존 데이터 마이그레이션 (item_id → catalog_item_id, stub_id = NULL)
    await queryRunner.query(`
      INSERT INTO collection_items (id, collection_id, catalog_item_id, stub_id, order_index, created_at)
      SELECT id, collection_id, item_id, NULL, order_index, created_at
      FROM collection_items_old
    `);

    await queryRunner.query(`DROP TABLE collection_items_old`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // collection_items 롤백
    await queryRunner.query(`ALTER TABLE collection_items RENAME TO collection_items_new`);

    await queryRunner.query(`
      CREATE TABLE collection_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(collection_id, item_id),
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      INSERT INTO collection_items (id, collection_id, item_id, order_index, created_at)
      SELECT id, collection_id, catalog_item_id, order_index, created_at
      FROM collection_items_new
    `);

    await queryRunner.query(`DROP TABLE collection_items_new`);

    // stubs 롤백
    await queryRunner.query(`DROP INDEX IF EXISTS idx_stubs_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_stubs_catalog_item`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_stubs_user`);
    await queryRunner.query(`DROP TABLE IF EXISTS stubs`);
  }
}
