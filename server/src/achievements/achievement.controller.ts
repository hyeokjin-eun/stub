import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AchievementService } from './achievement.service';

@Controller('achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  // 전체 업적 목록
  @Get()
  getAllAchievements() {
    return this.achievementService.getAllAchievements();
  }

  // 사용자 업적 목록 (달성 여부 포함)
  @Get('users/:userId')
  getUserAchievements(@Param('userId', ParseIntPipe) userId: number) {
    return this.achievementService.getUserAchievements(userId);
  }

  // 사용자 업적 통계
  @Get('users/:userId/stats')
  getUserAchievementStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.achievementService.getUserAchievementStats(userId);
  }
}
