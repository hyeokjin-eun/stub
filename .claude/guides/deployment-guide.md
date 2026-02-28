# OTBOOK - 배포 가이드

> Next.js SSR/CSR + NestJS + PM2 + nginx 배포 가이드

---

## 배포 방식 개요

OTBOOK은 **Next.js SSR/CSR**, **NestJS API 서버**, **PM2 프로세스 관리**, **nginx 리버스 프록시**를 사용합니다.

**배포 흐름:**
```
로컬 개발 → 빌드 (Client/Admin/Server) → PM2로 프로세스 실행 → nginx 리버스 프록시 → 배포 완료
```

**아키텍처:**
```
인터넷
  ↓
nginx (포트 80) - 리버스 프록시
  ├─→ Client-Web (localhost:3000) - Next.js SSR
  ├─→ Admin (localhost:3001) - Next.js SSR
  └─→ API Server (localhost:3002) - NestJS
```

---

## 빌드하기

### 1. Client-Web 빌드

```bash
cd client-web
npm run build
```

**빌드 결과:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

**생성된 파일:**
```
client-web/.next/
├── standalone/          # 독립 실행 파일
├── static/              # 정적 에셋
└── ...
```

---

### 2. Admin 빌드

```bash
cd admin
npm run build
```

**생성된 파일:**
```
admin/.next/
├── standalone/
├── static/
└── ...
```

---

### 3. Server 빌드

```bash
cd server
npm run build
```

**빌드 결과:**
```
✓ Compiling TypeScript
✓ Build successful
```

**생성된 파일:**
```
server/dist/
├── main.js              # 진입점
├── app.module.js
├── database/
├── auth/
└── ...
```

---

## PM2 프로세스 관리

### 1. PM2 설치

```bash
npm install -g pm2
```

### 2. 환경 변수 설정

```bash
# client-web/.env.production
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXTAUTH_URL=https://otbook.example.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# admin/.env.production
NEXT_PUBLIC_API_URL=http://localhost:3002

# server/.env
PORT=3002
DATABASE_PATH=./database.sqlite
```

### 3. PM2로 프로세스 실행

```bash
# Client-Web 실행
cd /path/to/project/client-web
npm run build
pm2 start npm --name "otbook-client" -- start

# Admin 실행
cd /path/to/project/admin
npm run build
pm2 start npm --name "otbook-admin" -- start

# Server 실행
cd /path/to/project/server
npm run build
pm2 start dist/main.js --name "otbook-server"
```

### 4. PM2 관리 명령어

```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs otbook-server
pm2 logs otbook-client

# 재시작
pm2 restart otbook-server
pm2 restart all

# 중지
pm2 stop otbook-server
pm2 delete otbook-server

# 시스템 부팅 시 자동 실행
pm2 startup
pm2 save
```

---

## nginx 리버스 프록시 설정

### 1. nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/otbook
```

**리버스 프록시 설정:**
```nginx
server {
    listen 80;
    server_name otbook.example.com;

    # 로그
    access_log /var/log/nginx/otbook_access.log;
    error_log /var/log/nginx/otbook_error.log;

    # Client-Web (/)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Server (/api)
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin (/admin)
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # 클라이언트 요청 크기 제한 (이미지 업로드)
    client_max_body_size 10M;
}
```

### 2. SSL/HTTPS 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d otbook.example.com

# 자동 갱신 설정 확인
sudo certbot renew --dry-run
```

**자동 생성된 HTTPS 설정:**
```nginx
server {
    listen 443 ssl http2;
    server_name otbook.example.com;

    ssl_certificate /etc/letsencrypt/live/otbook.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/otbook.example.com/privkey.pem;

    # ... (위와 동일한 location 설정)
}

server {
    listen 80;
    server_name otbook.example.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. 설정 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/otbook /etc/nginx/sites-enabled/

# 설정 파일 문법 검사
sudo nginx -t

# nginx 재시작
sudo systemctl reload nginx
```

---

## 배포 스크립트

### 1. 배포 스크립트 작성

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🏗️  Building OTBOOK..."

# Client-Web 빌드
echo "📦 Building client-web..."
cd client-web
npm install
npm run build
cd ..

# Admin 빌드
echo "📦 Building admin..."
cd admin
npm install
npm run build
cd ..

# Server 빌드
echo "📦 Building server..."
cd server
npm install
npm run build
cd ..

echo "🚀 Deploying with PM2..."

# PM2로 재시작 (이미 실행 중인 경우)
pm2 restart otbook-client || pm2 start npm --name "otbook-client" -- start --prefix client-web
pm2 restart otbook-admin || pm2 start npm --name "otbook-admin" -- start --prefix admin
pm2 restart otbook-server || pm2 start server/dist/main.js --name "otbook-server"

echo "💾 Saving PM2 configuration..."
pm2 save

echo "✅ Deployment complete!"
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🌐 Client: http://localhost:3000"
echo "🔧 Admin: http://localhost:3001"
echo "📡 API: http://localhost:3002"
```

---

### 2. 스크립트 실행 권한 부여

```bash
chmod +x deploy.sh
```

---

### 3. 배포 실행

```bash
./deploy.sh
```

---

## 원격 서버 배포

### 1. Git을 사용한 배포

```bash
# 서버에 접속
ssh user@your-server

# 프로젝트 클론 또는 Pull
cd /path/to/project
git pull origin main

# 배포 스크립트 실행
./deploy.sh
```

### 2. rsync를 사용한 배포 (빌드 파일만)

```bash
#!/bin/bash
# deploy-remote.sh

set -e

SERVER_USER="your-user"
SERVER_HOST="your-server-ip"
SERVER_PATH="/path/to/project"

echo "🏗️  Building locally..."
npm run build --prefix client-web
npm run build --prefix admin
npm run build --prefix server

echo "📤 Uploading to server..."
rsync -avz --delete client-web/.next/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/client-web/.next/
rsync -avz --delete admin/.next/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/admin/.next/
rsync -avz --delete server/dist/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/server/dist/

echo "🔄 Restarting PM2 processes..."
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_PATH} && pm2 restart all"

echo "✅ Deployment complete!"
```

---

## 수동 배포 (로컬 서버)

```bash
# 1. 빌드
cd /path/to/project
npm run build --prefix client-web
npm run build --prefix admin
npm run build --prefix server

# 2. PM2 재시작
pm2 restart otbook-client
pm2 restart otbook-admin
pm2 restart otbook-server

# 또는 모두 재시작
pm2 restart all
```

---

## 배포 확인

### 1. 브라우저 테스트

- **Client**: http://otbook.example.com
- **Admin**: http://otbook.example.com/admin

### 2. 파일 확인

```bash
# 배포된 파일 확인
ls -la /home/gurwls2399/client/
ls -la /home/gurwls2399/admin/
```

### 3. nginx 로그 확인

```bash
# 접근 로그
tail -f /var/log/nginx/otbook_access.log

# 에러 로그
tail -f /var/log/nginx/otbook_error.log
```

---

## 환경별 설정

### 개발 환경

```bash
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 프로덕션 환경

```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.otbook.example.com
```

**Next.js에서 사용:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL
```

---

## 성능 최적화

### 1. 이미지 최적화

**next.config.ts:**
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,  // Static Export에서는 필수
  },
}
```

**이미지 압축:**
```bash
# WebP 변환 (서버에서)
find public/images -name "*.jpg" -exec cwebp -q 80 {} -o {}.webp \;
```

---

### 2. CSS/JS 압축

**next.config.ts:**
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  compress: true,  // Gzip 압축
  productionBrowserSourceMaps: false,  // 소스맵 제거
}
```

---

### 3. nginx 캐싱

**nginx 설정:**
```nginx
# 정적 파일 캐싱 (1년)
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML 파일 캐싱 안 함 (항상 최신 버전)
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

---

## HTTPS 설정 (Let's Encrypt)

### 1. Certbot 설치

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

---

### 2. SSL 인증서 발급

```bash
sudo certbot --nginx -d otbook.example.com
```

**자동 갱신 설정:**
```bash
sudo certbot renew --dry-run
```

---

### 3. HTTPS 리다이렉트

Certbot이 자동으로 추가하지만, 수동으로 추가할 경우:

```nginx
server {
    listen 80;
    server_name otbook.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name otbook.example.com;

    ssl_certificate /etc/letsencrypt/live/otbook.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/otbook.example.com/privkey.pem;

    # ... 나머지 설정
}
```

---

## CI/CD (GitHub Actions)

### 1. GitHub Actions 설정

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Build Client
        run: |
          cd client-web
          npm ci
          npm run build

      - name: Build Admin
        run: |
          cd admin
          npm ci
          npm run build

      - name: Deploy to Server
        uses: easingthemes/ssh-deploy@v4
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          SOURCE: "client-web/out/ admin/out/"
          TARGET: "/home/gurwls2399/"

      - name: Reload nginx
        run: |
          ssh ${{ secrets.REMOTE_USER }}@${{ secrets.REMOTE_HOST }} 'sudo systemctl reload nginx'
```

---

### 2. GitHub Secrets 설정

Repository → Settings → Secrets → Actions:
- `SSH_PRIVATE_KEY`: SSH 개인 키
- `REMOTE_HOST`: 서버 IP 또는 도메인
- `REMOTE_USER`: SSH 사용자명

---

## 롤백

### 1. 이전 버전 백업

```bash
# 배포 전 백업
cp -r /home/gurwls2399/client /home/gurwls2399/client.backup
cp -r /home/gurwls2399/admin /home/gurwls2399/admin.backup
```

---

### 2. 롤백 실행

```bash
# 백업 복원
rm -rf /home/gurwls2399/client
mv /home/gurwls2399/client.backup /home/gurwls2399/client

rm -rf /home/gurwls2399/admin
mv /home/gurwls2399/admin.backup /home/gurwls2399/admin

# nginx 재시작
sudo systemctl reload nginx
```

---

## 문제 해결

### 404 에러 발생

**원인**: Next.js 라우팅이 nginx에서 처리되지 않음

**해결**:
```nginx
location / {
    try_files $uri $uri.html $uri/ /index.html;  # ← 이 라인 확인
}
```

---

### _next 정적 파일 로드 안 됨

**원인**: 경로 설정 문제

**해결**:
```nginx
location /_next/static/ {
    alias /home/gurwls2399/client/_next/static/;  # ← 정확한 경로
}
```

---

### 빌드 파일 크기가 큼

**해결**:
1. Unused dependencies 제거
2. Source maps 비활성화 (`productionBrowserSourceMaps: false`)
3. Tree shaking 확인

---

## 모니터링

### nginx 상태 확인

```bash
sudo systemctl status nginx
```

---

### 디스크 사용량 확인

```bash
du -sh /home/gurwls2399/client
du -sh /home/gurwls2399/admin
```

---

### 로그 모니터링

```bash
# 실시간 로그
tail -f /var/log/nginx/otbook_access.log

# 에러만 필터링
grep "error" /var/log/nginx/otbook_error.log
```

---

**배포 후 반드시 브라우저에서 모든 페이지를 테스트하세요!**
