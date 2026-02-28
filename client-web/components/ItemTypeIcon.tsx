import type { ItemType } from '@/lib/api/types'

interface Props {
  type: ItemType | 'ALL'
  size?: number
  color?: string
}

export function ItemTypeIcon({ type, size = 18, color = 'currentColor' }: Props) {
  switch (type) {
    case 'ALL':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 4개 점 그리드 - "전체" */}
          <circle cx="5" cy="5" r="2.5" fill={color} />
          <circle cx="12" cy="5" r="2.5" fill={color} />
          <circle cx="19" cy="5" r="2.5" fill={color} />
          <circle cx="5" cy="12" r="2.5" fill={color} />
          <circle cx="12" cy="12" r="2.5" fill={color} />
          <circle cx="19" cy="12" r="2.5" fill={color} />
          <circle cx="5" cy="19" r="2.5" fill={color} />
          <circle cx="12" cy="19" r="2.5" fill={color} />
          <circle cx="19" cy="19" r="2.5" fill={color} />
        </svg>
      )

    case 'TICKET':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 티켓 모양: 직사각형 + 왼쪽 반원 노치 + 오른쪽 반원 노치 + 점선 */}
          <rect x="1" y="5" width="22" height="14" rx="2" stroke={color} strokeWidth="1.8" fill="none" />
          {/* 왼쪽 노치 */}
          <path d="M7 5 A3 3 0 0 0 7 19" stroke={color} strokeWidth="1.8" fill="var(--bg, #0a0a0a)" strokeLinecap="round" />
          {/* 오른쪽 노치 */}
          <path d="M17 5 A3 3 0 0 1 17 19" stroke={color} strokeWidth="1.8" fill="var(--bg, #0a0a0a)" strokeLinecap="round" />
          {/* 점선 */}
          <line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      )

    case 'VIEWING':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 필름 프레임 */}
          <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.8" fill="none" />
          {/* 필름 구멍 왼쪽 */}
          <rect x="4" y="6.5" width="2" height="2.5" rx="0.5" fill={color} />
          <rect x="4" y="11" width="2" height="2.5" rx="0.5" fill={color} />
          <rect x="4" y="15.5" width="2" height="2.5" rx="0.5" fill={color} />
          {/* 필름 구멍 오른쪽 */}
          <rect x="18" y="6.5" width="2" height="2.5" rx="0.5" fill={color} />
          <rect x="18" y="11" width="2" height="2.5" rx="0.5" fill={color} />
          <rect x="18" y="15.5" width="2" height="2.5" rx="0.5" fill={color} />
          {/* 재생 삼각형 */}
          <path d="M10 9.5 L10 14.5 L15 12 Z" fill={color} />
        </svg>
      )

    case 'TRADING_CARD':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 뒷 카드 */}
          <rect x="5" y="4" width="14" height="18" rx="2" stroke={color} strokeWidth="1.8" fill="none" strokeDasharray="3 2" opacity="0.5" />
          {/* 앞 카드 */}
          <rect x="2" y="2" width="14" height="18" rx="2" stroke={color} strokeWidth="1.8" fill="var(--bg, #0a0a0a)" />
          {/* 카드 이미지 영역 */}
          <rect x="4.5" y="4.5" width="9" height="7" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
          {/* 카드 텍스트 라인 */}
          <line x1="4.5" y1="14" x2="13.5" y2="14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4.5" y1="16.5" x2="10" y2="16.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )

    case 'GOODS':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 쇼핑백 */}
          <path
            d="M6 2 L4 7 L4 20 Q4 21 5 21 L19 21 Q20 21 20 20 L20 7 L18 2 Z"
            stroke={color}
            strokeWidth="1.8"
            fill="none"
            strokeLinejoin="round"
          />
          {/* 가로선 (bag top) */}
          <line x1="4" y1="10" x2="20" y2="10" stroke={color} strokeWidth="1.5" />
          {/* 손잡이 */}
          <path d="M9 7 Q9 3.5 12 3.5 Q15 3.5 15 7" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      )

    default:
      return null
  }
}
