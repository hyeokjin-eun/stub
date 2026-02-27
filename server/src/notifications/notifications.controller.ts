import { Controller, Get, Patch, Delete, Post, Param, Query, ParseIntPipe, UseGuards, Req, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationType } from '../database/entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities';
import { Repository } from 'typeorm';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly svc: NotificationsService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.svc.findAll(req.user.userId, page, limit);
  }

  @Get('unread-count')
  unreadCount(@Req() req: any) {
    return this.svc.unreadCount(req.user.userId);
  }

  @Patch('read-all')
  markAllRead(@Req() req: any) {
    return this.svc.markAllRead(req.user.userId);
  }

  @Patch(':id/read')
  markRead(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.svc.markRead(req.user.userId, id);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(req.user.userId, id);
  }

  /** 시스템 공지 전체 발송 (어드민용) */
  @Post('system')
  async sendSystem(@Body() body: { message: string; targetUrl?: string }) {
    const users = await this.userRepo.find({ select: ['id'] });
    await Promise.all(
      users.map(u =>
        this.svc.create({
          userId: u.id,
          actorId: null,
          type: NotificationType.SYSTEM,
          message: body.message,
          targetUrl: body.targetUrl ?? null,
        }).catch(() => null)
      )
    );
    return { ok: true, sent: users.length };
  }
}
