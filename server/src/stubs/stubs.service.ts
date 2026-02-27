import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stub } from '../database/entities/stub.entity';

@Injectable()
export class StubsService {
  constructor(
    @InjectRepository(Stub)
    private readonly stubRepo: Repository<Stub>,
  ) {}

  // 유저의 모든 스텁 조회 (마이페이지)
  async findByUser(userId: number) {
    return this.stubRepo.find({
      where: { user_id: userId },
      relations: ['catalog_item', 'catalog_item.catalog_group', 'catalog_item.category'],
      order: { created_at: 'DESC' },
    });
  }

  // 특정 카탈로그 아이템에 대한 내 스텁 조회 (보유 여부 확인)
  async findByUserAndCatalogItem(userId: number, catalogItemId: number) {
    return this.stubRepo.findOne({
      where: { user_id: userId, catalog_item_id: catalogItemId },
      relations: ['catalog_item'],
    });
  }

  // 스텁 생성 (보유 등록)
  async create(
    userId: number,
    data: {
      catalog_item_id?: number;
      image_url?: string;
      status?: string;
      condition?: string;
      notes?: string;
      acquired_at?: Date;
    },
  ) {
    const stub = this.stubRepo.create({
      user_id: userId,
      ...data,
    });
    return this.stubRepo.save(stub);
  }

  // 스텁 수정
  async update(
    id: number,
    userId: number,
    data: Partial<{
      image_url: string;
      status: string;
      condition: string;
      notes: string;
      acquired_at: Date;
    }>,
  ) {
    const stub = await this.stubRepo.findOne({ where: { id, user_id: userId } });
    if (!stub) throw new NotFoundException('스텁을 찾을 수 없습니다');
    Object.assign(stub, data);
    return this.stubRepo.save(stub);
  }

  // 스텁 삭제 (보유 해제)
  async remove(id: number, userId: number) {
    const stub = await this.stubRepo.findOne({ where: { id, user_id: userId } });
    if (!stub) throw new NotFoundException('스텁을 찾을 수 없습니다');
    return this.stubRepo.remove(stub);
  }

  // 카탈로그 그룹 기준 보유 현황 (ex. OGT 156개 중 내가 몇개 가졌나)
  async getOwnedMapByGroup(userId: number, catalogGroupId: number) {
    const stubs = await this.stubRepo
      .createQueryBuilder('stub')
      .leftJoin('stub.catalog_item', 'item')
      .where('stub.user_id = :userId', { userId })
      .andWhere('item.catalog_group_id = :groupId', { groupId: catalogGroupId })
      .select(['stub.id', 'stub.catalog_item_id'])
      .getMany();

    // catalog_item_id → stub_id 맵으로 반환
    return stubs.reduce(
      (acc, stub) => {
        acc[stub.catalog_item_id] = stub.id;
        return acc;
      },
      {} as Record<number, number>,
    );
  }
}
