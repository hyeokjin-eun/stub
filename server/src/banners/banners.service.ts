import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { Banner } from '../database/entities';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepo: Repository<Banner>,
  ) {}

  async findAll() {
    const now = new Date();

    return this.bannerRepo.find({
      where: [
        {
          is_active: true,
          start_date: IsNull(),
          end_date: IsNull(),
        },
        {
          is_active: true,
          start_date: LessThanOrEqual(now),
          end_date: MoreThanOrEqual(now),
        },
        {
          is_active: true,
          start_date: LessThanOrEqual(now),
          end_date: IsNull(),
        },
        {
          is_active: true,
          start_date: IsNull(),
          end_date: MoreThanOrEqual(now),
        },
      ],
      order: { order_index: 'ASC' },
    });
  }

  async findAllAdmin() {
    return this.bannerRepo.find({
      order: { order_index: 'ASC' },
    });
  }
}
