import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from '../database/entities/app-settings.entity';

@Injectable()
export class AppSettingsService {
  constructor(
    @InjectRepository(AppSettings)
    private appSettingsRepo: Repository<AppSettings>,
  ) {}

  /**
   * 앱 설정 조회 (항상 첫 번째 레코드 반환)
   */
  async getSettings(): Promise<AppSettings> {
    let settings = await this.appSettingsRepo.findOne({ where: { id: 1 } });

    // 설정이 없으면 기본값 생성
    if (!settings) {
      settings = this.appSettingsRepo.create({
        app_title: 'STUB',
        app_subtitle: '당신의 추억을 수집하세요',
        app_description: '영화, 공연, 스포츠 티켓을 수집하고 공유하는 플랫폼',
      });
      await this.appSettingsRepo.save(settings);
    }

    return settings;
  }

  /**
   * 앱 설정 업데이트
   */
  async updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    let settings = await this.appSettingsRepo.findOne({ where: { id: 1 } });

    if (!settings) {
      settings = this.appSettingsRepo.create(data);
    } else {
      Object.assign(settings, data);
    }

    return this.appSettingsRepo.save(settings);
  }
}
