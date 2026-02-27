import { User } from '../database/entities';

export interface AchievementContext {
  userTicketCount: number;
  userLikeCount: number;
  userFollowerCount: number;
}

export interface AchievementDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  check: (user: User, context: AchievementContext) => Promise<boolean> | boolean;
}

export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition> = {
  FIRST_TICKET: {
    code: 'first_ticket',
    name: '첫 티켓',
    description: '첫 번째 티켓을 수집했습니다',
    icon: 'star',
    check: (user, context) => context.userTicketCount >= 1,
  },

  COLLECTOR_10: {
    code: 'collector_10',
    name: '컬렉터 입문',
    description: '10개의 티켓을 수집했습니다',
    icon: 'trophy',
    check: (user, context) => context.userTicketCount >= 10,
  },

  COLLECTOR_50: {
    code: 'collector_50',
    name: '진지한 컬렉터',
    description: '50개의 티켓을 수집했습니다',
    icon: 'trophy-gold',
    check: (user, context) => context.userTicketCount >= 50,
  },

  COLLECTOR_100: {
    code: 'collector_100',
    name: '열정적인 컬렉터',
    description: '100개의 티켓을 수집했습니다',
    icon: 'trophy-diamond',
    check: (user, context) => context.userTicketCount >= 100,
  },

  POPULAR: {
    code: 'popular',
    name: '인기 수집가',
    description: '100개의 좋아요를 받았습니다',
    icon: 'heart',
    check: (user, context) => context.userLikeCount >= 100,
  },

  POPULAR_MEGA: {
    code: 'popular_mega',
    name: '슈퍼스타',
    description: '500개의 좋아요를 받았습니다',
    icon: 'heart-fire',
    check: (user, context) => context.userLikeCount >= 500,
  },

  EARLY_BIRD: {
    code: 'early_bird',
    name: '얼리버드',
    description: '서비스 초기 가입자 (2025년 6월 이전)',
    icon: 'bird',
    check: (user) => user.created_at < new Date('2025-06-01'),
  },

  SOCIAL_BUTTERFLY: {
    code: 'social_butterfly',
    name: '소셜 나비',
    description: '팔로워 50명 달성',
    icon: 'users',
    check: (user, context) => context.userFollowerCount >= 50,
  },

  INFLUENCER: {
    code: 'influencer',
    name: '인플루언서',
    description: '팔로워 200명 달성',
    icon: 'users-star',
    check: (user, context) => context.userFollowerCount >= 200,
  },
};
