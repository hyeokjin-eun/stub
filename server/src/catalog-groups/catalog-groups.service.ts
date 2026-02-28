import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogGroup, Category } from '../database/entities';
import { CreateCatalogGroupDto } from './dto/create-catalog-group.dto';
import { UpdateCatalogGroupDto } from './dto/update-catalog-group.dto';
import { ItemType } from '../categories/categories.service';

export interface FindAllGroupsOptions {
  page?: number;
  limit?: number;
  categoryId?: number;      // 소분류 id로 필터
  itemType?: ItemType;      // item_type으로 필터 (카테고리 조인)
  isOfficial?: boolean;
}

@Injectable()
export class CatalogGroupsService {
  constructor(
    @InjectRepository(CatalogGroup)
    private catalogGroupRepo: Repository<CatalogGroup>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(userId: number, createDto: CreateCatalogGroupDto) {
    // 소분류(depth=2) 카테고리인지 검증
    const category = await this.categoryRepo.findOne({
      where: { id: createDto.category_id },
    });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다');
    }
    if (category.depth !== 2) {
      throw new BadRequestException('CatalogGroup은 소분류(depth=2) 카테고리에만 연결할 수 있습니다');
    }

    const group = this.catalogGroupRepo.create({
      ...createDto,
      creator_id: userId,
      is_official: false,
    });

    return this.catalogGroupRepo.save(group);
  }

  async findAll(options: FindAllGroupsOptions = {}) {
    const { page = 1, limit = 20, categoryId, itemType, isOfficial } = options;

    const query = this.catalogGroupRepo
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.category', 'category')
      .leftJoinAndSelect('category.parent', 'midCategory')
      .leftJoinAndSelect('midCategory.parent', 'rootCategory')
      .leftJoinAndSelect('group.creator', 'creator')
      .where('group.is_public = :isPublic', { isPublic: true })
      .andWhere('group.status = :status', { status: 'published' });

    if (categoryId) {
      query.andWhere('group.category_id = :categoryId', { categoryId });
    }

    // item_type 필터: 카테고리 계층 통해 대분류의 item_type 기준
    if (itemType) {
      query.andWhere('rootCategory.item_type = :itemType', { itemType });
    }

    if (isOfficial !== undefined) {
      query.andWhere('group.is_official = :isOfficial', { isOfficial });
    }

    const [groups, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('group.is_official', 'DESC')
      .addOrderBy('group.created_at', 'DESC')
      .getManyAndCount();

    return {
      data: groups.map((g) => this.sanitizeGroup(g)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const group = await this.catalogGroupRepo.findOne({
      where: { id },
      relations: ['category', 'category.parent', 'category.parent.parent', 'creator'],
    });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다');
    }

    await this.catalogGroupRepo.increment({ id }, 'view_count', 1);

    return this.sanitizeGroup(group);
  }

  async update(id: number, userId: number, updateDto: UpdateCatalogGroupDto) {
    const group = await this.catalogGroupRepo.findOne({ where: { id } });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다');
    }
    if (group.creator_id !== userId) {
      throw new ForbiddenException('본인의 그룹만 수정할 수 있습니다');
    }

    Object.assign(group, updateDto);
    return this.catalogGroupRepo.save(group);
  }

  async remove(id: number, userId: number) {
    const group = await this.catalogGroupRepo.findOne({ where: { id } });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다');
    }
    if (group.creator_id !== userId) {
      throw new ForbiddenException('본인의 그룹만 삭제할 수 있습니다');
    }

    await this.catalogGroupRepo.remove(group);
    return { message: '그룹이 삭제되었습니다' };
  }

  // ----------------------------------------------------------------
  // private
  // ----------------------------------------------------------------

  private sanitizeGroup(group: any) {
    if (group.creator) {
      const { password_hash, oauth_id, ...creator } = group.creator;
      group.creator = creator;
    }
    return group;
  }
}
