import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { AppSettingsService } from './app-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('app-settings')
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  // GET /app-settings - 앱 설정 조회 (public)
  @Get()
  getSettings() {
    return this.appSettingsService.getSettings();
  }

  // PUT /app-settings - 앱 설정 업데이트 (admin only)
  @Put()
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateSettings(@Body() data: { app_title?: string; app_subtitle?: string; app_description?: string }) {
    return this.appSettingsService.updateSettings(data);
  }
}
