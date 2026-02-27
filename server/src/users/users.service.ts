import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  User,
  CatalogItem,
  Like,
  Follow,
  UserAchievement,
} from '../database/entities';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(CatalogItem)
    private catalogItemRepo: Repository<CatalogItem>,
    @InjectRepository(Like)
    private likeRepo: Repository<Like>,
    @InjectRepository(Follow)
    private followRepo: Repository<Follow>,
    @InjectRepository(UserAchievement)
    private userAchievementRepo: Repository<UserAchievement>,
  ) {}

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    const { password_hash, oauth_id, ...result } = user;
    return result;
  }

  async count(): Promise<{ total: number }> {
    const total = await this.userRepo.count();
    return { total };
  }

  async findAll(page: number = 1, limit: number = 20) {
    const [users, total] = await this.userRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const usersWithoutPassword = users.map((user) => {
      const { password_hash, oauth_id, ...result } = user;
      return result;
    });

    return {
      data: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    // 닉네임 중복 체크 (변경하는 경우)
    if (updateUserDto.nickname && updateUserDto.nickname !== user.nickname) {
      const existingUser = await this.userRepo.findOne({
        where: { nickname: updateUserDto.nickname },
      });
      if (existingUser) {
        throw new ConflictException('이미 사용 중인 닉네임입니다');
      }
    }

    Object.assign(user, updateUserDto);
    await this.userRepo.save(user);

    const { password_hash, oauth_id, ...result } = user;
    return result;
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    await this.userRepo.remove(user);
    return { message: '사용자가 삭제되었습니다' };
  }

  async getUserStats(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    const [
      ticketCount,
      followerCount,
      followingCount,
      totalLikes,
      achievementCount,
    ] = await Promise.all([
      this.catalogItemRepo.count({ where: { owner_id: id } }),
      this.followRepo.count({ where: { following_id: id } }),
      this.followRepo.count({ where: { follower_id: id } }),
      this.likeRepo
        .createQueryBuilder('like')
        .innerJoin('like.item', 'item')
        .where('item.owner_id = :userId', { userId: id })
        .getCount(),
      this.userAchievementRepo.count({ where: { user_id: id } }),
    ]);

    return {
      user_id: id,
      ticket_count: ticketCount,
      follower_count: followerCount,
      following_count: followingCount,
      total_likes: totalLikes,
      achievement_count: achievementCount,
    };
  }
}
