# Google OAuth 설정 가이드

OTBOOK 앱에서 Google 로그인을 사용하려면 Google Cloud Console에서 OAuth 클라이언트 ID를 생성해야 합니다.

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다
2. 새 프로젝트를 생성하거나 기존 프로젝트를 선택합니다

### 1.2 OAuth 동의 화면 구성
1. 좌측 메뉴에서 **APIs & Services > OAuth consent screen** 선택
2. User Type을 **External**로 선택하고 **CREATE** 클릭
3. 앱 정보 입력:
   - App name: `OTBOOK`
   - User support email: 본인 이메일
   - Developer contact information: 본인 이메일
4. **SAVE AND CONTINUE** 클릭
5. Scopes 페이지에서 **ADD OR REMOVE SCOPES** 클릭
6. 다음 스코프를 추가:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
7. **SAVE AND CONTINUE** 클릭
8. Test users 페이지에서 테스트 사용자 추가 (개발 중에 로그인할 이메일)
9. **SAVE AND CONTINUE** 클릭

### 1.3 OAuth 2.0 클라이언트 ID 생성
1. 좌측 메뉴에서 **APIs & Services > Credentials** 선택
2. **+ CREATE CREDENTIALS** 클릭 > **OAuth client ID** 선택
3. Application type: **Web application** 선택
4. Name: `OTBOOK Web Client`
5. **Authorized redirect URIs** 섹션에서 **+ ADD URI** 클릭
6. 다음 URI 추가:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. (프로덕션용) 배포 후 프로덕션 도메인도 추가:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
8. **CREATE** 클릭
9. 생성된 **Client ID**와 **Client Secret**을 복사합니다

## 2. 환경 변수 설정

1. `.env.example` 파일을 복사하여 `.env.local` 파일 생성:
   ```bash
   cp .env.example .env.local
   ```

2. `.env.local` 파일을 열어 다음 값을 입력:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=임의의_랜덤_문자열
   GOOGLE_CLIENT_ID=복사한_클라이언트_ID
   GOOGLE_CLIENT_SECRET=복사한_클라이언트_시크릿
   ```

### NEXTAUTH_SECRET 생성 방법
터미널에서 다음 명령어 실행:
```bash
openssl rand -base64 32
```

## 3. 개발 서버 실행

```bash
npm run dev
```

이제 http://localhost:3000/login 에서 Google 로그인을 사용할 수 있습니다.

## 4. 프로덕션 배포 시

1. Google Cloud Console에서 프로덕션 도메인을 Authorized redirect URIs에 추가
2. 배포 환경의 환경 변수에 다음 값 설정:
   - `NEXTAUTH_URL`: 프로덕션 도메인 (예: `https://otbook.app`)
   - `NEXTAUTH_SECRET`: 프로덕션용 시크릿 (개발용과 다른 값 사용)
   - `GOOGLE_CLIENT_ID`: Google 클라이언트 ID
   - `GOOGLE_CLIENT_SECRET`: Google 클라이언트 시크릿

## 5. 트러블슈팅

### "Error: redirect_uri_mismatch"
- Google Cloud Console의 Authorized redirect URIs에 정확히 일치하는 URI가 등록되어 있는지 확인
- 프로토콜(http/https), 포트 번호까지 정확히 일치해야 함

### "Error: invalid_client"
- `.env.local`의 `GOOGLE_CLIENT_ID`와 `GOOGLE_CLIENT_SECRET`이 올바른지 확인
- 환경 변수 변경 후 개발 서버를 재시작했는지 확인

### "Access blocked: This app's request is invalid"
- OAuth consent screen이 올바르게 구성되었는지 확인
- Test users에 로그인하려는 이메일이 추가되어 있는지 확인
