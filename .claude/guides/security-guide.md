# OTBOOK 보안 가이드

> Next.js 프론트엔드 보안 모범 사례

---

## 보안 영역

| 영역 | 위협 | 대응 |
|------|------|------|
| XSS | 악의적 스크립트 주입 | React 자동 이스케이프, dangerouslySetInnerHTML 금지 |
| CSRF | 교차 사이트 요청 위조 | SameSite 쿠키, CSRF 토큰 (향후 백엔드 연동 시) |
| 데이터 검증 | 잘못된 입력 | 클라이언트/서버 이중 검증 |
| 의존성 보안 | 취약한 패키지 | npm audit, Dependabot |
| 환경 변수 | 민감 정보 노출 | .env 파일, NEXT_PUBLIC_ 프리픽스 주의 |

---

## XSS 방어

### 1. React 자동 이스케이프 (기본 보호)

```typescript
// ✅ 안전 - React가 자동으로 이스케이프
const userInput = '<script>alert("XSS")</script>'
<div>{userInput}</div>
// 렌더링: &lt;script&gt;alert("XSS")&lt;/script&gt;
```

---

### 2. dangerouslySetInnerHTML 금지

```typescript
// ❌ 위험 - XSS 취약점
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 안전 - 마크다운 라이브러리 사용 (sanitize 포함)
import DOMPurify from 'isomorphic-dompurify'

const sanitized = DOMPurify.sanitize(userInput)
<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

---

### 3. URL 검증

```typescript
// ❌ 위험 - javascript: URL 허용
<a href={userProvidedUrl}>Link</a>

// ✅ 안전 - URL 검증
function sanitizeUrl(url: string): string {
  if (url.startsWith('javascript:') || url.startsWith('data:')) {
    return '#'
  }
  return url
}

<a href={sanitizeUrl(userProvidedUrl)}>Link</a>
```

---

## 환경 변수 보안

### 1. 클라이언트 노출 최소화

```bash
# .env.local

# ❌ 클라이언트 노출 - NEXT_PUBLIC_ 프리픽스
NEXT_PUBLIC_API_URL=https://api.otbook.com

# ✅ 서버 전용 (Static Export에서는 사용 불가)
SECRET_KEY=xxxxx
```

**Next.js Static Export 주의사항:**
- `NEXT_PUBLIC_` 환경 변수만 사용 가능
- 빌드 시 코드에 하드코딩됨
- **민감한 정보는 절대 `NEXT_PUBLIC_`에 넣지 말 것**

---

### 2. .gitignore 설정

```gitignore
# 환경 변수
.env
.env.local
.env*.local

# 빌드 결과
/out
/.next

# 민감 정보
*.pem
*.key
credentials.json
```

---

## 입력 검증

### 1. 클라이언트 검증

```typescript
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

function validateTicketTitle(title: string): boolean {
  // 특수문자 제한
  const regex = /^[a-zA-Z0-9가-힣\s\-]+$/
  return title.length > 0 && title.length <= 100 && regex.test(title)
}
```

---

### 2. 파일 업로드 검증 (향후)

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

function validateFile(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('허용되지 않은 파일 형식입니다')
  }

  if (file.size > MAX_SIZE) {
    throw new Error('파일 크기는 5MB 이하여야 합니다')
  }

  return true
}
```

---

## 의존성 보안

### 1. npm audit

```bash
# 취약점 검사
npm audit

# 자동 수정
npm audit fix

# 강제 수정 (주의: breaking change 가능)
npm audit fix --force
```

---

### 2. Dependabot 설정 (GitHub)

`.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/client-web"
    schedule:
      interval: "weekly"

  - package-ecosystem: "npm"
    directory: "/admin"
    schedule:
      interval: "weekly"
```

---

## HTTPS / SSL

### 1. 프로덕션 HTTPS 필수

```nginx
# nginx 설정
server {
    listen 443 ssl http2;
    server_name otbook.example.com;

    ssl_certificate /etc/letsencrypt/live/otbook.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/otbook.example.com/privkey.pem;

    # ... 나머지 설정
}

# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

---

### 2. 개발 환경 HTTPS (선택)

```bash
# mkcert로 로컬 SSL 인증서 생성
brew install mkcert
mkcert -install
mkcert localhost

# Next.js HTTPS 실행 (별도 설정 필요)
```

---

## 쿠키 보안 (향후 인증 구현 시)

```typescript
// ✅ 안전한 쿠키 설정
document.cookie = `token=${token}; Secure; HttpOnly; SameSite=Strict; Max-Age=86400`

// Secure: HTTPS에서만 전송
// HttpOnly: JavaScript 접근 불가 (XSS 방어)
// SameSite=Strict: CSRF 방어
// Max-Age: 만료 시간 (초)
```

---

## localStorage/sessionStorage 주의

```typescript
// ❌ 위험 - 민감 정보 저장 금지
localStorage.setItem('password', password)
localStorage.setItem('apiKey', apiKey)

// ✅ 안전 - 비민감 정보만
localStorage.setItem('theme', 'dark')
localStorage.setItem('recentSearches', JSON.stringify(searches))
```

**주의:**
- localStorage는 XSS 공격에 취약
- 민감한 정보는 저장하지 말 것
- 인증 토큰은 HttpOnly 쿠키 권장

---

## Content Security Policy (CSP)

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js 필요
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
```

---

## 보안 헤더 (nginx)

```nginx
# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 모범 사례

### 1. 최소 권한 원칙

```typescript
// ❌ 나쁜 예 - 모든 데이터 노출
const user = {
  id, name, email, password, internalId, roles
}

// ✅ 좋은 예 - 필요한 것만
const publicUser = {
  id, name
}
```

---

### 2. 에러 메시지 일반화

```typescript
// ❌ 나쁜 예 - 내부 정보 노출
throw new Error('Database connection failed: user table not found')

// ✅ 좋은 예 - 일반적 메시지
throw new Error('서비스에 일시적인 문제가 발생했습니다')
```

---

### 3. Rate Limiting (향후 백엔드)

```typescript
// 클라이언트단 간단한 Rate Limiting
const rateLimiter = {
  attempts: 0,
  lastAttempt: 0,

  check(maxAttempts: number, windowMs: number): boolean {
    const now = Date.now()

    if (now - this.lastAttempt > windowMs) {
      this.attempts = 0
    }

    if (this.attempts >= maxAttempts) {
      throw new Error('너무 많은 요청입니다. 잠시 후 다시 시도하세요')
    }

    this.attempts++
    this.lastAttempt = now
    return true
  }
}

// 사용
rateLimiter.check(5, 60000) // 1분에 5회
```

---

## 체크리스트

### 배포 전 보안 점검

- [ ] 환경 변수 `.env` 파일 Git 커밋 안 됨
- [ ] `dangerouslySetInnerHTML` 사용하지 않음 (또는 sanitize 적용)
- [ ] 사용자 입력 모두 검증
- [ ] HTTPS 설정 완료
- [ ] npm audit 실행 및 취약점 해결
- [ ] 보안 헤더 설정 (nginx)
- [ ] 에러 메시지에 내부 정보 미포함
- [ ] localStorage에 민감 정보 미저장
- [ ] 파일 업로드 검증 (타입, 크기)
- [ ] CSP 헤더 설정

---

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [React Security Best Practices](https://react.dev/reference/react-dom/components/common#security-considerations)

---

**보안은 지속적인 프로세스입니다. 정기적으로 검토하세요!**
