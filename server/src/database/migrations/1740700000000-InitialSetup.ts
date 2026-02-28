import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1740700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
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
        phone VARCHAR(20),
        birth_date DATE,
        onboarding_completed BOOLEAN DEFAULT 0,
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        UNIQUE(oauth_provider, oauth_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
    await queryRunner.query(`CREATE INDEX idx_users_nickname ON users(nickname)`);
    await queryRunner.query(`CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id)`);

    // Categories table
    await queryRunner.query(`
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50) NOT NULL,
        color VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        depth INTEGER NOT NULL DEFAULT 0,
        parent_id INTEGER,
        item_type VARCHAR(30),
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Catalog Groups table
    await queryRunner.query(`
      CREATE TABLE catalog_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category_id INTEGER NOT NULL,
        creator_id INTEGER NOT NULL,
        is_official BOOLEAN DEFAULT 0,
        color VARCHAR(50),
        icon VARCHAR(50),
        thumbnail_url VARCHAR(500),
        is_public BOOLEAN DEFAULT 1,
        status VARCHAR(20) DEFAULT 'published',
        view_count INTEGER DEFAULT 0,
        ticket_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(creator_id) REFERENCES users(id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_catalog_groups_category ON catalog_groups(category_id)`);
    await queryRunner.query(`CREATE INDEX idx_catalog_groups_creator ON catalog_groups(creator_id)`);

    // Catalog Items table
    await queryRunner.query(`
      CREATE TABLE catalog_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category_id INTEGER NOT NULL,
        catalog_group_id INTEGER,
        owner_id INTEGER NOT NULL,
        item_type VARCHAR(30) DEFAULT 'TICKET',
        status VARCHAR(20) DEFAULT 'collected',
        image_url VARCHAR(500),
        thumbnail_url VARCHAR(500),
        color VARCHAR(50),
        icon VARCHAR(50),
        is_public BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(catalog_group_id) REFERENCES catalog_groups(id),
        FOREIGN KEY(owner_id) REFERENCES users(id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_catalog_items_category ON catalog_items(category_id)`);
    await queryRunner.query(`CREATE INDEX idx_catalog_items_group ON catalog_items(catalog_group_id)`);

    // Catalog Item Metadata table
    await queryRunner.query(`
      CREATE TABLE catalog_item_metadata (
        item_id INTEGER PRIMARY KEY,
        metadata TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(item_id) REFERENCES catalog_items(id) ON DELETE CASCADE
      )
    `);

    // Stubs table
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
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(catalog_item_id) REFERENCES catalog_items(id) ON DELETE SET NULL,
        UNIQUE(user_id, catalog_item_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_stubs_user ON stubs(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_stubs_item ON stubs(catalog_item_id)`);

    // Collections table
    await queryRunner.query(`
      CREATE TABLE collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_collections_user ON collections(user_id)`);

    // Collection Items table
    await queryRunner.query(`
      CREATE TABLE collection_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER NOT NULL,
        catalog_item_id INTEGER NOT NULL,
        stub_id INTEGER,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        FOREIGN KEY(catalog_item_id) REFERENCES catalog_items(id) ON DELETE CASCADE,
        FOREIGN KEY(stub_id) REFERENCES stubs(id) ON DELETE SET NULL,
        UNIQUE(collection_id, catalog_item_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_collection_items_collection ON collection_items(collection_id)`);
    await queryRunner.query(`CREATE INDEX idx_collection_items_catalog_item ON collection_items(catalog_item_id)`);
    await queryRunner.query(`CREATE INDEX idx_collection_items_stub ON collection_items(stub_id)`);

    // Likes table
    await queryRunner.query(`
      CREATE TABLE likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(item_id) REFERENCES catalog_items(id) ON DELETE CASCADE,
        UNIQUE(user_id, item_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_likes_user ON likes(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_likes_item ON likes(item_id)`);

    // Follows table
    await queryRunner.query(`
      CREATE TABLE follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER NOT NULL,
        following_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(following_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(follower_id, following_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_follows_follower ON follows(follower_id)`);
    await queryRunner.query(`CREATE INDEX idx_follows_following ON follows(following_id)`);

    // Notifications table
    await queryRunner.query(`
      CREATE TABLE notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        link VARCHAR(500),
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_notifications_user ON notifications(user_id)`);

    // Banners table
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

    // User Achievements table
    await queryRunner.query(`
      CREATE TABLE user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_code VARCHAR(50) NOT NULL,
        achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, achievement_code)
      )
    `);

    // Category UI Configs table
    await queryRunner.query(`
      CREATE TABLE category_ui_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL UNIQUE,
        is_default BOOLEAN DEFAULT 0,
        skip_ui BOOLEAN DEFAULT 0,
        auto_expand BOOLEAN DEFAULT 0,
        show_in_filter BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    // Item Type UI Configs table
    await queryRunner.query(`
      CREATE TABLE item_type_ui_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_type VARCHAR(50) NOT NULL UNIQUE,
        is_default BOOLEAN DEFAULT 0,
        skip_ui BOOLEAN DEFAULT 0,
        show_in_tab BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // App Settings table
    await queryRunner.query(`
      CREATE TABLE app_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_title VARCHAR(50) NOT NULL DEFAULT 'STUB',
        app_subtitle VARCHAR(100),
        app_description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Collection Likes table
    await queryRunner.query(`
      CREATE TABLE collection_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        collection_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        UNIQUE(user_id, collection_id)
      )
    `);

    // Collection Comments table
    await queryRunner.query(`
      CREATE TABLE collection_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS collection_comments`);
    await queryRunner.query(`DROP TABLE IF EXISTS collection_likes`);
    await queryRunner.query(`DROP TABLE IF EXISTS app_settings`);
    await queryRunner.query(`DROP TABLE IF EXISTS item_type_ui_configs`);
    await queryRunner.query(`DROP TABLE IF EXISTS category_ui_configs`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_achievements`);
    await queryRunner.query(`DROP TABLE IF EXISTS banners`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications`);
    await queryRunner.query(`DROP TABLE IF EXISTS follows`);
    await queryRunner.query(`DROP TABLE IF EXISTS likes`);
    await queryRunner.query(`DROP TABLE IF EXISTS collection_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS collections`);
    await queryRunner.query(`DROP TABLE IF EXISTS stubs`);
    await queryRunner.query(`DROP TABLE IF EXISTS catalog_item_metadata`);
    await queryRunner.query(`DROP TABLE IF EXISTS catalog_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS catalog_groups`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
