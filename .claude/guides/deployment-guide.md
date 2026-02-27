# OTBOOK - 배포 가이드

> Next.js Static Export + nginx 배포 가이드

---

## 배포 방식 개요

OTBOOK은 **Next.js Static Export**를 사용하여 정적 HTML/CSS/JS 파일로 빌드하고, nginx를 통해 서빙합니다.

**배포 흐름:**
```
로컬 개발 → npm run build → out/ 폴더 생성 → nginx 서버로 복사 → 배포 완료
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
✓ Generating static pages (5/5)
✓ Finalizing page optimization
✓ Collecting build traces
✓ Exported as static HTML to: out/
```

**생성된 파일:**
```
client-web/out/
├── index.html              # /
├── search.html             # /search
├── catalog.html            # /catalog
├── catalog/
│   └── [id].html           # /catalog/:id
├── my.html                 # /my
├── _next/
│   ├── static/
│   │   ├── chunks/         # JS 번들
│   │   └── css/            # CSS 파일
│   └── ...
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
admin/out/
├── index.html              # /admin
├── tickets.html
├── groups.html
├── users.html
└── _next/...
```

---

## nginx 설정

### 1. nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/otbook
```

**기본 설정:**
```nginx
server {
    listen 80;
    server_name otbook.example.com;  # 도메인으로 변경

    # 로그
    access_log /var/log/nginx/otbook_access.log;
    error_log /var/log/nginx/otbook_error.log;

    # Client-Web (/)
    location / {
        root /home/gurwls2399/client;
        try_files $uri $uri.html $uri/ /index.html;
        index index.html;
    }

    # Admin (/admin)
    location /admin {
        alias /home/gurwls2399/admin;
        try_files $uri $uri.html $uri/ /admin/index.html;
        index index.html;
    }

    # Next.js 정적 파일 (JS, CSS)
    location /_next/static/ {
        alias /home/gurwls2399/client/_next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 이미지, 폰트 등 정적 파일
    location ~* \.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /home/gurwls2399/client;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;
}
```

---

### 2. 설정 활성화

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
npm run build
cd ..

# Admin 빌드
echo "📦 Building admin..."
cd admin
npm run build
cd ..

echo "🚀 Deploying to server..."

# 서버에 배포 (rsync 사용)
SERVER_USER="gurwls2399"
SERVER_HOST="your-server-ip"
SERVER_CLIENT_PATH="/home/gurwls2399/client"
SERVER_ADMIN_PATH="/home/gurwls2399/admin"

# Client 배포
rsync -avz --delete client-web/out/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_CLIENT_PATH}/

# Admin 배포
rsync -avz --delete admin/out/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_ADMIN_PATH}/

echo "🔄 Reloading nginx..."
ssh ${SERVER_USER}@${SERVER_HOST} 'sudo systemctl reload nginx'

echo "✅ Deployment complete!"
echo "🌐 Client: http://otbook.example.com"
echo "🔧 Admin: http://otbook.example.com/admin"
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

## 수동 배포

rsync가 없거나 로컬 서버인 경우:

```bash
# Client 배포
cd client-web
npm run build
sudo cp -r out/* /home/gurwls2399/client/

# Admin 배포
cd ../admin
npm run build
sudo cp -r out/* /home/gurwls2399/admin/

# nginx 재시작
sudo systemctl reload nginx
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
