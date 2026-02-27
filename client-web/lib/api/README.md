# OTBOOK API Client

프론트엔드에서 백엔드 API를 호출하기 위한 클라이언트 라이브러리입니다.

## 설정

### 환경 변수

`.env.local` 파일에 API URL을 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## 사용 방법

### 1. 인증 (Authentication)

```typescript
import { authApi } from '@/lib/api'

// 회원가입
const user = await authApi.signup({
  email: 'user@example.com',
  password: 'password123',
  nickname: '닉네임',
  bio: '자기소개 (선택)',
})

// 로그인
const { access_token, user } = await authApi.login({
  email: 'user@example.com',
  password: 'password123',
})

// 현재 사용자 정보 조회
const me = await authApi.getMe()

// 로그아웃
authApi.logout()

// 인증 상태 확인
const isAuthenticated = authApi.isAuthenticated()
```

### 2. React Hook 사용

```typescript
'use client'

import { useAuth } from '@/lib/hooks/useAuth'

export default function MyComponent() {
  const { user, loading, error, login, signup, logout } = useAuth()

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password123' })
      // 로그인 성공
    } catch (err) {
      // 에러 처리
      console.error(err)
    }
  }

  if (loading) return <div>로딩 중...</div>
  if (!user) return <button onClick={handleLogin}>로그인</button>

  return <div>환영합니다, {user.nickname}님!</div>
}
```

### 3. 티켓 (Catalog Items) API

```typescript
import { catalogItemsApi } from '@/lib/api'

// 티켓 목록 조회 (페이지네이션)
const { data, total, page, totalPages } = await catalogItemsApi.getAll({
  page: 1,
  limit: 20,
  category_id: 1, // 선택: 카테고리 필터
  owner_id: 1, // 선택: 소유자 필터
})

// 티켓 상세 조회
const ticket = await catalogItemsApi.getById(1)

// 티켓 생성
const newTicket = await catalogItemsApi.create({
  title: '아이유 콘서트 2025',
  description: '아이유 The Golden Hour 서울 공연',
  category_id: 1,
  status: 'collected',
  metadata: {
    type: 'ticket',
    event_date: '2025-05-15',
    venue: '올림픽공원 체조경기장',
    seat_info: 'A구역 12열 5번',
    section: 'VIP',
    price: 150000,
  },
})

// 티켓 수정
const updated = await catalogItemsApi.update(1, {
  title: '수정된 제목',
})

// 티켓 삭제
await catalogItemsApi.delete(1)
```

### 4. 카테고리 API

```typescript
import { categoriesApi } from '@/lib/api'

// 전체 카테고리 조회
const categories = await categoriesApi.getAll()

// ID로 카테고리 조회
const category = await categoriesApi.getById(1)

// 코드로 카테고리 조회
const musicCategory = await categoriesApi.getByCode('MUSIC')
```

### 5. 좋아요 API

```typescript
import { likesApi } from '@/lib/api'

// 좋아요 토글
const { liked, message } = await likesApi.toggle(1)

// 내가 좋아요한 티켓 목록
const myLikes = await likesApi.getMyLikes()

// 좋아요 여부 확인
const { liked } = await likesApi.checkLike(1)
```

### 6. 팔로우 API

```typescript
import { followsApi } from '@/lib/api'

// 팔로우 토글
const { following, message } = await followsApi.toggle(userId)

// 팔로워 목록
const followers = await followsApi.getFollowers(userId)

// 팔로잉 목록
const following = await followsApi.getFollowing(userId)

// 팔로우 여부 확인
const { following } = await followsApi.checkFollow(userId)
```

### 7. 업적 (Achievements) API

```typescript
import { achievementsApi } from '@/lib/api'

// 전체 업적 목록
const achievements = await achievementsApi.getAll()

// 사용자의 업적 (달성 여부 포함)
const userAchievements = await achievementsApi.getUserAchievements(userId)

// 사용자 업적 통계
const stats = await achievementsApi.getUserAchievementStats(userId)
```

### 8. 사용자 API

```typescript
import { usersApi } from '@/lib/api'

// 사용자 조회
const user = await usersApi.getById(1)

// 사용자 통계
const stats = await usersApi.getStats(1)
// { user_id, ticket_count, follower_count, following_count, total_likes, achievement_count }

// 프로필 수정
const updated = await usersApi.update(1, {
  nickname: '새로운닉네임',
  bio: '새로운 자기소개',
})
```

### 9. 파일 업로드 API

```typescript
import { uploadApi } from '@/lib/api'

// 이미지 업로드
const handleFileUpload = async (file: File) => {
  const response = await uploadApi.uploadImage(file)
  // { filename, url, size, mimetype }

  // 전체 URL 생성
  const fullUrl = uploadApi.getImageUrl(response.url)
  // http://localhost:3002/uploads/images/xxxxx.png
}
```

## 에러 처리

모든 API 호출은 axios 기반이므로 try-catch로 에러를 처리하세요:

```typescript
try {
  const data = await catalogItemsApi.getAll()
} catch (error: any) {
  console.error('API 에러:', error.response?.data?.message || error.message)
}
```

## 인증 토큰

- 로그인 시 JWT 토큰이 자동으로 localStorage에 저장됩니다
- 이후 모든 API 요청에 자동으로 Authorization 헤더가 추가됩니다
- 401 에러 발생 시 자동으로 로그아웃됩니다

## TypeScript 타입

모든 API 응답과 요청에 대한 TypeScript 타입이 정의되어 있습니다:

```typescript
import type {
  User,
  Category,
  CatalogItem,
  CatalogGroup,
  Achievement,
  // ... 기타
} from '@/lib/api/types'
```
