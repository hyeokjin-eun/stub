# OTBOOK API 문서

> RESTful API 엔드포인트 가이드

**Base URL**: `http://localhost:3002`

---

## 인증

### Google OAuth 로그인

```http
POST /auth/google
Content-Type: application/json

{
  "token": "google-oauth-token"
}
```

**Response**:
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "사용자",
    "role": "USER"
  }
}
```

### 로그인 (이메일/비밀번호)

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 프로필 조회

```http
GET /auth/profile
Authorization: Bearer {token}
```

**Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "사용자",
  "bio": "영화를 사랑하는 컬렉터",
  "avatar_url": null,
  "role": "USER",
  "created_at": "2026-02-28T00:00:00.000Z"
}
```

---

## 사용자

### 사용자 목록 조회

```http
GET /users?page=1&limit=20
```

### 사용자 상세 조회

```http
GET /users/:id
```

### 사용자 수정

```http
PATCH /users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "nickname": "새로운닉네임",
  "bio": "새로운 소개"
}
```

### 사용자 삭제 (탈퇴)

```http
DELETE /users/:id
Authorization: Bearer {token}
```

### 사용자 수 조회

```http
GET /users/count
```

---

## 카테고리

### 카테고리 목록

```http
GET /categories
```

**Response**:
```json
[
  {
    "id": 1,
    "code": "CINEMA",
    "name": "영화",
    "icon": "film",
    "color": "#2a4c9f",
    "created_at": "2026-02-28T00:00:00.000Z"
  }
]
```

---

## 카탈로그 그룹

### 그룹 목록 조회

```http
GET /catalog-groups?page=1&limit=100&category_id=1
```

**Query Parameters**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `category_id`: 카테고리 필터 (선택)

**Response**:
```json
{
  "data": [
    {
      "id": 49,
      "parent_group_id": 1,
      "category_id": 1,
      "category": {
        "id": 1,
        "code": "CINEMA",
        "name": "영화"
      },
      "name": "오리지널 그래비티 티켓 49-60",
      "description": null,
      "thumbnail_url": null,
      "color": null,
      "view_count": 1250,
      "ticket_count": 12,
      "created_at": "2026-02-28T00:00:00.000Z"
    }
  ],
  "total": 48,
  "page": 1,
  "limit": 100
}
```

### 그룹 상세 조회

```http
GET /catalog-groups/:id
```

### 그룹 생성 (Admin)

```http
POST /catalog-groups
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "parent_group_id": 1,
  "category_id": 1,
  "name": "그룹 이름",
  "description": "설명"
}
```

### 그룹 조회수 증가

```http
POST /catalog-groups/:id/view
```

---

## 카탈로그 아이템 (티켓)

### 티켓 목록 조회

```http
GET /catalog-items?page=1&limit=20&category_id=1&catalog_group_id=49
```

**Query Parameters**:
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수
- `category_id`: 카테고리 필터
- `catalog_group_id`: 그룹 필터

**Response**:
```json
{
  "data": [
    {
      "id": 589,
      "catalog_group_id": 49,
      "category_id": 1,
      "title": "OGT No.49 그래비티 티켓",
      "description": null,
      "image_url": "https://example.com/image.jpg",
      "metadata": {
        "metadata": {
          "section": "VIP",
          "row": "A",
          "seat": "1"
        }
      },
      "color": null,
      "created_at": "2026-02-28T00:00:00.000Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

### 티켓 상세 조회

```http
GET /catalog-items/:id
```

### 티켓 생성 (Admin)

```http
POST /catalog-items
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "catalog_group_id": 49,
  "category_id": 1,
  "title": "티켓 제목",
  "description": "설명",
  "image_url": "https://example.com/image.jpg",
  "metadata": {
    "section": "VIP",
    "row": "A",
    "seat": "1"
  }
}
```

---

## Stub (티켓 수집)

### 내 티켓 목록

```http
GET /stubs/my
Authorization: Bearer {token}
```

**Response**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "catalog_item_id": 589,
    "catalog_item": {
      "id": 589,
      "title": "OGT No.49 그래비티 티켓",
      "image_url": "https://example.com/image.jpg"
    },
    "image_url": "https://example.com/my-ticket.jpg",
    "status": "collected",
    "created_at": "2026-02-28T00:00:00.000Z"
  }
]
```

### 티켓 수집

```http
POST /stubs
Authorization: Bearer {token}
Content-Type: application/json

{
  "catalog_item_id": 589,
  "image_url": "https://example.com/my-ticket.jpg"
}
```

### 티켓 수집 해제

```http
DELETE /stubs/:id
Authorization: Bearer {token}
```

---

## 컬렉션

### 컬렉션 목록

```http
GET /collections?page=1&limit=20&user_id=1
```

### 컬렉션 상세

```http
GET /collections/:id
```

### 컬렉션 생성

```http
POST /collections
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "내 컬렉션",
  "description": "설명",
  "is_public": true
}
```

### 컬렉션 수정

```http
PATCH /collections/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "수정된 제목",
  "is_public": false
}
```

### 컬렉션 삭제

```http
DELETE /collections/:id
Authorization: Bearer {token}
```

---

## 좋아요

### 내 좋아요 목록

```http
GET /likes/my
Authorization: Bearer {token}
```

**Response**:
```json
[
  {
    "id": 589,
    "title": "OGT No.49 그래비티 티켓",
    "image_url": "https://example.com/image.jpg",
    "category": {
      "code": "CINEMA",
      "name": "영화"
    }
  }
]
```

### 좋아요 추가

```http
POST /likes
Authorization: Bearer {token}
Content-Type: application/json

{
  "catalog_item_id": 589
}
```

### 좋아요 취소

```http
DELETE /likes/:catalog_item_id
Authorization: Bearer {token}
```

---

## 팔로우

### 팔로워 목록

```http
GET /follows/:user_id/followers
```

### 팔로잉 목록

```http
GET /follows/:user_id/following
```

### 팔로우

```http
POST /follows
Authorization: Bearer {token}
Content-Type: application/json

{
  "following_id": 2
}
```

### 언팔로우

```http
DELETE /follows/:following_id
Authorization: Bearer {token}
```

---

## 알림

### 알림 목록

```http
GET /notifications?page=1&limit=20
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "type": "LIKE",
      "title": "새로운 좋아요",
      "content": "누군가 당신의 티켓을 좋아합니다",
      "link": "/catalog/589",
      "is_read": false,
      "created_at": "2026-02-28T00:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

### 알림 읽음 처리

```http
PATCH /notifications/:id/read
Authorization: Bearer {token}
```

### 미읽은 알림 개수

```http
GET /notifications/unread/count
Authorization: Bearer {token}
```

**Response**:
```json
{
  "count": 3
}
```

---

## 배너

### 활성 배너 목록

```http
GET /banners/active
```

**Response**:
```json
[
  {
    "id": 1,
    "title": "배너 제목",
    "image_url": "https://example.com/banner.jpg",
    "link_url": "/catalog/49",
    "order_index": 1,
    "is_active": true,
    "created_at": "2026-02-28T00:00:00.000Z"
  }
]
```

### 배너 목록 (Admin)

```http
GET /banners
Authorization: Bearer {admin-token}
```

### 배너 생성 (Admin)

```http
POST /banners
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "title": "배너 제목",
  "image_url": "https://example.com/banner.jpg",
  "link_url": "/catalog/49",
  "order_index": 1
}
```

### 배너 순서 조정 (Admin)

```http
PATCH /banners/:id/order
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "order_index": 2
}
```

---

## 업적

### 업적 목록

```http
GET /achievements
Authorization: Bearer {token}
```

**Response**:
```json
[
  {
    "code": "FIRST_TICKET",
    "name": "첫 번째 티켓",
    "description": "첫 티켓을 수집하세요",
    "icon": "ticket",
    "achieved": true
  }
]
```

---

## 파일 업로드

### 이미지 업로드

```http
POST /upload/image
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
```

**Response**:
```json
{
  "url": "http://localhost:3002/uploads/image-1234567890.jpg"
}
```

---

## 에러 응답

모든 API는 에러 발생 시 다음 형식으로 응답합니다:

```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request"
}
```

**주요 상태 코드**:
- `200` - 성공
- `201` - 생성 성공
- `400` - 잘못된 요청
- `401` - 인증 필요
- `403` - 권한 없음
- `404` - 찾을 수 없음
- `500` - 서버 오류

---

## 인증 헤더

대부분의 API는 JWT 토큰 인증이 필요합니다:

```http
Authorization: Bearer {jwt-token}
```

NextAuth를 사용하는 경우 세션에서 자동으로 토큰을 가져옵니다.

---

**Updated**: 2026-02-28
