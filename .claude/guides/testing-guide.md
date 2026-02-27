# OTBOOK 테스트 가이드

> Next.js 프론트엔드 테스트 전략

---

## 테스트 스택

### Frontend Testing

| 도구 | 용도 | 버전 |
|------|------|------|
| Jest | 테스트 프레임워크 | 29+ |
| React Testing Library | 컴포넌트 테스트 | 14+ |
| @testing-library/jest-dom | Jest DOM matchers | 6+ |
| @testing-library/user-event | 사용자 이벤트 시뮬레이션 | 14+ |

---

## 설치

```bash
cd client-web

# 테스트 라이브러리 설치
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# TypeScript 지원
npm install --save-dev @types/jest
```

---

## Jest 설정

### jest.config.js

```javascript
// client-web/jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // next.config.js와 .env 파일 로드
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

---

### jest.setup.js

```javascript
// client-web/jest.setup.js
import '@testing-library/jest-dom'
```

---

### package.json 스크립트

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 컴포넌트 테스트

### 1. Button 컴포넌트 테스트

```typescript
// components/ui/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('렌더링 되어야 한다', () => {
    render(<Button>클릭</Button>)
    expect(screen.getByText('클릭')).toBeInTheDocument()
  })

  it('클릭 시 onClick 핸들러가 호출되어야 한다', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>클릭</Button>)

    await user.click(screen.getByText('클릭'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 상태에서는 클릭이 작동하지 않아야 한다', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick} disabled>클릭</Button>)

    await user.click(screen.getByText('클릭'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('variant에 따라 다른 스타일이 적용되어야 한다', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    const button = screen.getByText('Primary')

    expect(button).toHaveClass('bg-[#c9a84c]')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-[#1c1c1c]')
  })
})
```

---

### 2. TicketCard 컴포넌트 테스트

```typescript
// components/features/ticket/__tests__/TicketCard.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TicketCard } from '../TicketCard'
import { Ticket } from '@/types/ticket'

const mockTicket: Ticket = {
  id: '1',
  title: '서울재즈페스티벌 2025',
  date: '2025-05-15',
  venue: '올림픽공원',
  category: 'MUSIC',
  color: 'purple',
  icon: 'music',
  grade: 'S',
  status: 'collected',
  likes: 189,
}

describe('TicketCard', () => {
  it('티켓 정보가 표시되어야 한다', () => {
    render(<TicketCard ticket={mockTicket} />)

    expect(screen.getByText('서울재즈페스티벌 2025')).toBeInTheDocument()
    expect(screen.getByText('2025-05-15')).toBeInTheDocument()
    expect(screen.getByText('올림픽공원')).toBeInTheDocument()
    expect(screen.getByText('❤️ 189')).toBeInTheDocument()
  })

  it('등급 뱃지가 표시되어야 한다', () => {
    render(<TicketCard ticket={mockTicket} />)
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('클릭 시 onClick 핸들러가 호출되어야 한다', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<TicketCard ticket={mockTicket} onClick={handleClick} />)

    await user.click(screen.getByText('서울재즈페스티벌 2025'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

---

### 3. Form 테스트

```typescript
// components/features/ticket/__tests__/TicketForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TicketForm } from '../TicketForm'

describe('TicketForm', () => {
  it('폼 입력이 작동해야 한다', async () => {
    const user = userEvent.setup()
    render(<TicketForm />)

    const titleInput = screen.getByPlaceholderText('티켓 제목')
    await user.type(titleInput, '콘서트 티켓')

    expect(titleInput).toHaveValue('콘서트 티켓')
  })

  it('빈 값 제출 시 검증 에러가 표시되어야 한다', async () => {
    const user = userEvent.setup()
    render(<TicketForm />)

    const submitButton = screen.getByText('저장')
    await user.click(submitButton)

    expect(screen.getByText('티켓 제목을 입력하세요')).toBeInTheDocument()
    expect(screen.getByText('날짜를 선택하세요')).toBeInTheDocument()
    expect(screen.getByText('장소를 입력하세요')).toBeInTheDocument()
  })

  it('유효한 데이터 제출 시 onSubmit이 호출되어야 한다', async () => {
    const handleSubmit = jest.fn()
    const user = userEvent.setup()

    render(<TicketForm onSubmit={handleSubmit} />)

    await user.type(screen.getByPlaceholderText('티켓 제목'), '콘서트')
    await user.type(screen.getByLabelText('날짜'), '2025-06-01')
    await user.type(screen.getByPlaceholderText('장소'), '올림픽공원')

    await user.click(screen.getByText('저장'))

    expect(handleSubmit).toHaveBeenCalledWith({
      title: '콘서트',
      date: '2025-06-01',
      venue: '올림픽공원',
    })
  })
})
```

---

## 유틸리티 함수 테스트

### lib/utils 테스트

```typescript
// lib/utils/__tests__/format.test.ts
import { formatDate, formatNumber } from '../format'

describe('formatDate', () => {
  it('날짜를 올바르게 포맷해야 한다', () => {
    expect(formatDate('2025-05-15')).toBe('2025년 5월 15일')
  })

  it('잘못된 날짜는 원본을 반환해야 한다', () => {
    expect(formatDate('invalid')).toBe('invalid')
  })
})

describe('formatNumber', () => {
  it('숫자를 천 단위로 포맷해야 한다', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('0을 처리해야 한다', () => {
    expect(formatNumber(0)).toBe('0')
  })
})
```

---

## Mocking

### 1. API Mocking

```typescript
// lib/api/__tests__/tickets.test.ts
import { getTickets } from '../tickets'

// fetch mock
global.fetch = jest.fn()

describe('getTickets', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('티켓 목록을 반환해야 한다', async () => {
    const mockTickets = [{ id: '1', title: 'Test Ticket' }]

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTickets,
    })

    const tickets = await getTickets()

    expect(fetch).toHaveBeenCalledWith('/api/tickets')
    expect(tickets).toEqual(mockTickets)
  })

  it('에러 발생 시 예외를 throw 해야 한다', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(getTickets()).rejects.toThrow()
  })
})
```

---

### 2. Router Mocking (Next.js)

```typescript
// __tests__/pages/catalog.test.tsx
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import CatalogPage from '@/app/catalog/page'

// Next.js Router mock
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('CatalogPage', () => {
  it('카탈로그 페이지가 렌더링되어야 한다', () => {
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      pathname: '/catalog',
    })

    render(<CatalogPage />)

    expect(screen.getByText('카탈로그')).toBeInTheDocument()
  })
})
```

---

## 테스트 Coverage

### Coverage 설정

```json
// package.json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

---

### Coverage 확인

```bash
npm run test:coverage

# 결과 예시:
# ----------------------|---------|----------|---------|---------|-------------------
# File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
# ----------------------|---------|----------|---------|---------|-------------------
# All files             |   85.5  |   78.2   |   88.9  |   85.1  |
# components/ui         |   92.3  |   85.7   |   100   |   91.8  |
#  Button.tsx           |   100   |   100    |   100   |   100   |
#  Card.tsx             |   87.5  |   75     |   100   |   86.4  | 12-15
# ----------------------|---------|----------|---------|---------|-------------------
```

---

## 스냅샷 테스트

```typescript
// components/ui/__tests__/Button.snapshot.test.tsx
import { render } from '@testing-library/react'
import { Button } from '../Button'

describe('Button 스냅샷 테스트', () => {
  it('primary variant 스냅샷', () => {
    const { container } = render(<Button variant="primary">클릭</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('secondary variant 스냅샷', () => {
    const { container } = render(<Button variant="secondary">클릭</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('disabled 스냅샷', () => {
    const { container } = render(<Button disabled>클릭</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
```

---

## 테스트 모범 사례

### 1. AAA 패턴 (Arrange-Act-Assert)

```typescript
it('버튼 클릭 시 카운터가 증가해야 한다', async () => {
  // Arrange (준비)
  const user = userEvent.setup()
  render(<Counter />)

  // Act (실행)
  await user.click(screen.getByText('+'))

  // Assert (검증)
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

---

### 2. 테스트 격리

```typescript
describe('TicketList', () => {
  beforeEach(() => {
    // 각 테스트 전에 초기화
    jest.clearAllMocks()
  })

  it('테스트 1', () => {
    // ...
  })

  it('테스트 2', () => {
    // 이전 테스트의 영향을 받지 않음
  })
})
```

---

### 3. 의미 있는 Query 사용

```typescript
// ❌ 나쁜 예 - 구현 세부사항에 의존
screen.getByClassName('button-primary')

// ✅ 좋은 예 - 사용자 관점
screen.getByRole('button', { name: '저장' })
screen.getByLabelText('이메일')
screen.getByPlaceholderText('검색어를 입력하세요')
```

---

### 4. 비동기 테스트

```typescript
it('데이터 로딩 후 표시되어야 한다', async () => {
  render(<TicketList />)

  // 로딩 표시 확인
  expect(screen.getByText('로딩 중...')).toBeInTheDocument()

  // 데이터 로드 대기
  await screen.findByText('서울재즈페스티벌')

  // 로딩 표시 사라짐
  expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument()
})
```

---

## 실행

```bash
# 모든 테스트 실행
npm test

# Watch 모드
npm run test:watch

# Coverage 포함
npm run test:coverage

# 특정 파일만
npm test Button.test.tsx

# 특정 describe/it만
npm test -- -t "버튼 클릭"
```

---

## CI/CD 통합

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd client-web
          npm ci

      - name: Run tests
        run: |
          cd client-web
          npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./client-web/coverage/lcov.info
```

---

## 다음 단계

- **[frontend-guide.md](./frontend-guide.md)** - 컴포넌트 작성
- **[error-handling-guide.md](./error-handling-guide.md)** - 에러 케이스 테스트
- **[deployment-guide.md](./deployment-guide.md)** - CI/CD 파이프라인

---

**테스트는 코드 품질을 보장하는 핵심입니다!**
