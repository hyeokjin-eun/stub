import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import {
  User,
  UserAchievement,
  CatalogItem,
  Like,
  Follow,
} from '../database/entities';
import {
  ACHIEVEMENT_DEFINITIONS,
  AchievementContext,
} from './achievement.definitions';

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserAchievement)
    private userAchievementRepo: Repository<UserAchievement>,
    @InjectRepository(CatalogItem)
    private catalogItemRepo: Repository<CatalogItem>,
    @InjectRepository(Like)
    private likeRepo: Repository<Like>,
    @InjectRepository(Follow)
    private followRepo: Repository<Follow>,
  ) {}

  // Context 빌드
  async buildContext(userId: number): Promise<AchievementContext> {
    const [userTicketCount, userLikeCount, userFollowerCount] =
      await Promise.all([
        this.catalogItemRepo.count({
          where: { owner_id: userId, status: 'collected' },
        }),
        this.likeRepo
          .createQueryBuilder('like')
          .innerJoin('like.item', 'item')
          .where('item.owner_id = :userId', { userId })
          .getCount(),
        this.followRepo.count({ where: { following_id: userId } }),
      ]);

    return { userTicketCount, userLikeCount, userFollowerCount };
  }

  // 티켓 추가시 자동 체크
  @OnEvent('ticket.created')
  async onTicketCreated(event: { userId: number }) {
    await this.checkAllAchievements(event.userId);
  }

  // 좋아요 추가시 자동 체크
  @OnEvent('like.created')
  async onLikeCreated(event: { targetUserId: number }) {
    await this.checkAllAchievements(event.targetUserId);
  }

  // 팔로우시 자동 체크
  @OnEvent('follow.created')
  async onFollowCreated(event: { followingId: number }) {
    await this.checkAllAchievements(event.followingId);
  }

  // 모든 업적 체크
  async checkAllAchievements(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;

    const context = await this.buildContext(userId);

    for (const [key, achievement] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
      const hasAchieved = await this.userHasAchievement(
        userId,
        achievement.code,
      );
      if (hasAchieved) continue;

      const unlocked = await achievement.check(user, context);
      if (unlocked) {
        await this.grantAchievement(userId, achievement.code);
      }
    }
  }

  // 업적 보유 확인
  async userHasAchievement(
    userId: number,
    achievementCode: string,
  ): Promise<boolean> {
    const count = await this.userAchievementRepo.count({
      where: { user_id: userId, achievement_code: achievementCode },
    });
    return count > 0;
  }

  // 업적 부여
  async grantAchievement(userId: number, code: string) {
    await this.userAchievementRepo.insert({
      user_id: userId,
      achievement_code: code,
    });

    console.log(`✅ Achievement unlocked: ${code} for user ${userId}`);

    // TODO: 알림 발송 (향후)
    // this.notificationService.send(userId, `업적 달성: ${ACHIEVEMENT_DEFINITIONS[code.toUpperCase()].name}`)
  }

  // 전체 업적 목록 조회 (프론트엔드용)
  getAllAchievements() {
    return Object.values(ACHIEVEMENT_DEFINITIONS).map((a) => ({
      code: a.code,
      name: a.name,
      description: a.description,
      icon: a.icon,
    }));
  }

  // 사용자 업적 목록
  async getUserAchievements(userId: number) {
    const achieved = await this.userAchievementRepo.find({
      where: { user_id: userId },
    });

    return this.getAllAchievements().map((achievement) => ({
      ...achievement,
      achieved: achieved.some((a) => a.achievement_code === achievement.code),
      achievedAt:
        achieved.find((a) => a.achievement_code === achievement.code)
          ?.achieved_at || null,
    }));
  }

  // 사용자 업적 통계
  async getUserAchievementStats(userId: number) {
    const totalAchievements = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
    const userAchievements = await this.userAchievementRepo.count({
      where: { user_id: userId },
    });

    return {
      total: totalAchievements,
      unlocked: userAchievements,
      percentage: Math.round((userAchievements / totalAchievements) * 100),
    };
  }
}
