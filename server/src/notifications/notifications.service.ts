import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  /** 알림 생성 (내부 서비스에서 호출) */
  async create(dto: {
    userId: number;
    actorId?: number | null;
    type: NotificationType;
    message: string;
    targetUrl?: string | null;
  }): Promise<Notification> {
    const notif = this.repo.create({
      user_id:    dto.userId,
      actor_id:   dto.actorId ?? null,
      type:       dto.type,
      message:    dto.message,
      target_url: dto.targetUrl ?? null,
    });
    return this.repo.save(notif);
  }

  /** 내 알림 목록 */
  async findAll(userId: number, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: { user_id: userId },
      relations: ['actor'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, unread: data.filter(n => !n.is_read).length };
  }

  /** 읽지 않은 알림 수 */
  async unreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.repo.count({ where: { user_id: userId, is_read: false } });
    return { count };
  }

  /** 단건 읽음 처리 */
  async markRead(userId: number, id: number) {
    await this.repo.update({ id, user_id: userId }, { is_read: true });
    return { ok: true };
  }

  /** 전체 읽음 처리 */
  async markAllRead(userId: number) {
    await this.repo.update({ user_id: userId, is_read: false }, { is_read: true });
    return { ok: true };
  }

  /** 알림 삭제 */
  async remove(userId: number, id: number) {
    await this.repo.delete({ id, user_id: userId });
    return { ok: true };
  }
}
