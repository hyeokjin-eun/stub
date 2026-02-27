import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Follow, User } from '../database/entities';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../database/entities/notification.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private followRepo: Repository<Follow>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private eventEmitter: EventEmitter2,
    private notificationsService: NotificationsService,
  ) {}

  async toggle(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new BadRequestException('자기 자신을 팔로우할 수 없습니다');
    }

    const [targetUser, follower] = await Promise.all([
      this.userRepo.findOne({ where: { id: followingId } }),
      this.userRepo.findOne({ where: { id: followerId } }),
    ]);
    if (!targetUser) throw new NotFoundException('사용자를 찾을 수 없습니다');

    const existingFollow = await this.followRepo.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (existingFollow) {
      await this.followRepo.remove(existingFollow);
      return { following: false, message: '팔로우가 취소되었습니다' };
    } else {
      const follow = this.followRepo.create({
        follower_id: followerId,
        following_id: followingId,
      });
      await this.followRepo.save(follow);
      this.eventEmitter.emit('follow.created', { followingId });

      // 팔로우 알림 발송
      await this.notificationsService.create({
        userId: followingId,
        actorId: followerId,
        type: NotificationType.FOLLOW,
        message: `${follower?.nickname ?? '누군가'}님이 회원님을 팔로우하기 시작했어요.`,
        targetUrl: `/my`,
      }).catch(() => null);

      return { following: true, message: '팔로우가 추가되었습니다' };
    }
  }

  async getFollowers(userId: number, page: number = 1, limit: number = 20) {
    const [follows, total] = await this.followRepo.findAndCount({
      where: { following_id: userId },
      relations: ['follower'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: follows.map((f) => {
        const { password_hash, oauth_id, ...user } = f.follower;
        return user;
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFollowing(userId: number, page: number = 1, limit: number = 20) {
    const [follows, total] = await this.followRepo.findAndCount({
      where: { follower_id: userId },
      relations: ['following'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: follows.map((f) => {
        const { password_hash, oauth_id, ...user } = f.following;
        return user;
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async checkFollowing(followerId: number, followingId: number) {
    const follow = await this.followRepo.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    return { following: !!follow };
  }
}
