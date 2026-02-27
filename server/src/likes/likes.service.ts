import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Like, CatalogItem } from '../database/entities';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepo: Repository<Like>,
    @InjectRepository(CatalogItem)
    private catalogItemRepo: Repository<CatalogItem>,
    private eventEmitter: EventEmitter2,
  ) {}

  async toggle(userId: number, itemId: number) {
    const item = await this.catalogItemRepo.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다');
    }

    const existingLike = await this.likeRepo.findOne({
      where: { user_id: userId, item_id: itemId },
    });

    if (existingLike) {
      // 좋아요 취소
      await this.likeRepo.remove(existingLike);
      await this.catalogItemRepo.decrement({ id: itemId }, 'like_count', 1);

      return { liked: false, message: '좋아요가 취소되었습니다' };
    } else {
      // 좋아요 추가
      const like = this.likeRepo.create({ user_id: userId, item_id: itemId });
      await this.likeRepo.save(like);
      await this.catalogItemRepo.increment({ id: itemId }, 'like_count', 1);

      // 이벤트 발행 (아이템 소유자의 업적 체크)
      this.eventEmitter.emit('like.created', { targetUserId: item.owner_id });

      return { liked: true, message: '좋아요가 추가되었습니다' };
    }
  }

  async getUserLikes(userId: number, page: number = 1, limit: number = 20) {
    const [likes, total] = await this.likeRepo.findAndCount({
      where: { user_id: userId },
      relations: [
        'item',
        'item.metadata',
        'item.owner',
        'item.category',
        'item.catalog_group',
        'item.catalog_group.category',
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: likes.map((like) => like.item),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async checkLiked(userId: number, itemId: number) {
    const like = await this.likeRepo.findOne({
      where: { user_id: userId, item_id: itemId },
    });

    return { liked: !!like };
  }
}
