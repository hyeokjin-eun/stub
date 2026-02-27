import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionLike } from '../database/entities/collection-like.entity';
import { Collection } from '../database/entities/collection.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../database/entities/notification.entity';
import { User } from '../database/entities';

@Injectable()
export class CollectionLikesService {
  constructor(
    @InjectRepository(CollectionLike)
    private readonly repo: Repository<CollectionLike>,
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async toggle(userId: number, collectionId: number) {
    const existing = await this.repo.findOne({
      where: { user_id: userId, collection_id: collectionId },
    });

    if (existing) {
      await this.repo.remove(existing);
    } else {
      await this.repo.save(
        this.repo.create({ user_id: userId, collection_id: collectionId }),
      );

      // 좋아요 알림 (본인 컬렉션 제외)
      const [collection, actor] = await Promise.all([
        this.collectionRepo.findOne({ where: { id: collectionId } }),
        this.userRepo.findOne({ where: { id: userId } }),
      ]);
      if (collection && collection.user_id !== userId) {
        await this.notificationsService.create({
          userId: collection.user_id,
          actorId: userId,
          type: NotificationType.LIKE_COLLECTION,
          message: `${actor?.nickname ?? '누군가'}님이 "${collection.name}" 컬렉션을 좋아해요.`,
          targetUrl: `/collection/${collectionId}`,
        }).catch(() => null);
      }
    }

    const likeCount = await this.repo.count({ where: { collection_id: collectionId } });
    return { liked: !existing, likeCount };
  }

  /** 특정 컬렉션 좋아요 수 + 내가 눌렀는지 여부 */
  async getStatus(userId: number, collectionId: number) {
    const [liked, likeCount] = await Promise.all([
      this.repo.findOne({ where: { user_id: userId, collection_id: collectionId } }),
      this.repo.count({ where: { collection_id: collectionId } }),
    ]);
    return { liked: !!liked, likeCount };
  }

  /** 컬렉션 ID 배열의 좋아요 수 일괄 조회 */
  async getBulkCounts(collectionIds: number[]): Promise<Record<number, number>> {
    if (collectionIds.length === 0) return {};
    const rows = await this.repo
      .createQueryBuilder('cl')
      .select('cl.collection_id', 'collection_id')
      .addSelect('COUNT(*)', 'count')
      .where('cl.collection_id IN (:...ids)', { ids: collectionIds })
      .groupBy('cl.collection_id')
      .getRawMany();

    const result: Record<number, number> = {};
    collectionIds.forEach((id) => (result[id] = 0));
    rows.forEach((r) => (result[Number(r.collection_id)] = Number(r.count)));
    return result;
  }
}
