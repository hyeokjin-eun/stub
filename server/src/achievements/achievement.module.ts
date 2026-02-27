import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  UserAchievement,
  CatalogItem,
  Like,
  Follow,
} from '../database/entities';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserAchievement,
      CatalogItem,
      Like,
      Follow,
    ]),
  ],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService],
})
export class AchievementModule {}
