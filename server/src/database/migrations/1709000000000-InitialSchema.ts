import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1709000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Users
    await queryRunner.query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        nickname VARCHAR(100) UNIQUE NOT NULL,
        bio TEXT,
        avatar_url VARCHAR(500),
        oauth_provider VARCHAR(50),
        oauth_id VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(oauth_provider, oauth_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
    await queryRunner.query(`CREATE INDEX idx_users_nickname ON users(nickname)`);
    await queryRunner.query(`CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id)`);

    // 2. Categories
    await queryRunner.query(`
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50) NOT NULL,
        color VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Catalog Groups
    await queryRunner.query(`
      CREATE TABLE catalog_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category_id INTEGER NOT NULL,
        creator_id INTEGER NOT NULL,
        is_official BOOLEAN DEFAULT FALSE,
        color VARCHAR(50) NOT NULL,
        icon VARCHAR(50) NOT NULL,
        thumbnail_url VARCHAR(500),
        is_public BOOLEAN DEFAULT TRUE,
        status VARCHAR(20) DEFAULT 'published',
        view_count INTEGER DEFAULT 0,
        ticket_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (creator_id) REFERENCES users(id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_catalog_groups_category ON catalog_groups(category_id)`);
    await queryRunner.query(`CREATE INDEX idx_catalog_groups_creator ON catalog_groups(creator_id)`);
    await queryRunner.query(`CREATE INDEX idx_catalog_groups_official ON catalog_groups(is_official)`);

    // 4. Catalog Items
    await queryRunner.query(`
      CREATE TABLE catalog_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category_id INTEGER NOT NULL,
        catalog_group_id INTEGER,
        owner_id INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'collected',
        image_url VARCHAR(500),
        thumbnail_url VARCHAR(500),
        color VARCHAR(50),
        icon VARCHAR(50),
        is_public BOOLEAN DEFAULT TRUE,
        like_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (catalog_group_id) REFERENCES catalog_groups(id),
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_catalog_items_owner ON catalog_items(owner_id)`);
    await queryRunner.query(`CREATE INDEX idx_catalog_items_category ON catalog_items(category_id)`);
    await queryRunner.query(`CREATE INDEX idx_catalog_items_group ON catalog_items(catalog_group_id)`);
    await queryRunner.query(`CREATE INDEX idx_catalog_items_status ON catalog_items(status)`);

    // 5. Catalog Item Metadata
    await queryRunner.query(`
      CREATE TABLE catalog_item_metadata (
        item_id INTEGER PRIMARY KEY,
        metadata TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE
      )
    `);

    // 6. Likes
    await queryRunner.query(`
      CREATE TABLE likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_likes_user ON likes(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_likes_item ON likes(item_id)`);

    // 7. Follows
    await queryRunner.query(`
      CREATE TABLE follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER NOT NULL,
        following_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id),
        CHECK (follower_id != following_id),
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_follows_follower ON follows(follower_id)`);
    await queryRunner.query(`CREATE INDEX idx_follows_following ON follows(following_id)`);

    // 8. Collections
    await queryRunner.query(`
      CREATE TABLE collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 9. Collection Items
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

    await queryRunner.query(`CREATE INDEX idx_collection_items_collection ON collection_items(collection_id)`);
    await queryRunner.query(`CREATE INDEX idx_collection_items_item ON collection_items(item_id)`);

    // 10. User Achievements
    await queryRunner.query(`
      CREATE TABLE user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_code VARCHAR(50) NOT NULL,
        achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_code),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_user_achievements_user ON user_achievements(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_user_achievements_code ON user_achievements(achievement_code)`);

    // 11. Search History
    await queryRunner.query(`
      CREATE TABLE search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        query VARCHAR(200) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_search_history_user ON search_history(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_search_history_created ON search_history(created_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (due to foreign key constraints)
    await queryRunner.query(`DROP TABLE IF EXISTS search_history`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_achievements`);
    await queryRunner.query(`DROP TABLE IF EXISTS collection_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS collections`);
    await queryRunner.query(`DROP TABLE IF EXISTS follows`);
    await queryRunner.query(`DROP TABLE IF EXISTS likes`);
    await queryRunner.query(`DROP TABLE IF EXISTS catalog_item_metadata`);
    await queryRunner.query(`DROP TABLE IF EXISTS catalog_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS catalog_groups`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
