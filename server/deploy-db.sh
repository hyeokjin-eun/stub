#!/bin/bash

# OTBOOK Database Deployment Script
# 이 스크립트는 새로운 환경에 DB를 배포할 때 사용합니다

set -e  # 에러 발생 시 중단

echo "🚀 OTBOOK Database Deployment"
echo "================================"

DB_FILE="otbook.sqlite"
BACKUP_DIR="backups"

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# 기존 DB 백업 (존재하는 경우)
if [ -f "$DB_FILE" ]; then
  BACKUP_FILE="$BACKUP_DIR/otbook-$(date +%Y%m%d-%H%M%S).sqlite"
  echo "📦 Backing up existing database to $BACKUP_FILE"
  cp "$DB_FILE" "$BACKUP_FILE"
  rm "$DB_FILE"
fi

# TypeORM 마이그레이션 실행
echo "⚙️  Running TypeORM migrations..."
npm run migration:run

# 시드 데이터 적용
echo "🌱 Applying seed data..."
if [ -f "src/database/seed-data.sql" ]; then
  sqlite3 "$DB_FILE" < src/database/seed-data.sql
  echo "✅ Seed data applied successfully"
else
  echo "⚠️  Warning: seed-data.sql not found"
fi

# DB 상태 확인
echo ""
echo "📊 Database Status:"
echo "-------------------"
sqlite3 "$DB_FILE" << 'SQL'
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Catalog Groups: ' || COUNT(*) FROM catalog_groups;
SELECT 'Catalog Items: ' || COUNT(*) FROM catalog_items;
SELECT 'Banners: ' || COUNT(*) FROM banners;
SQL

echo ""
echo "✨ Database deployment completed!"
echo "================================"
