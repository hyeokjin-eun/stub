import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CatalogGroup } from '../database/entities';
import { CreateCatalogGroupDto } from './dto/create-catalog-group.dto';
import { UpdateCatalogGroupDto } from './dto/update-catalog-group.dto';

@Injectable()
export class CatalogGroupsService {
  constructor(
    @InjectRepository(CatalogGroup)
    private catalogGroupRepo: Repository<CatalogGroup>,
  ) {}

  async create(userId: number, createDto: CreateCatalogGroupDto) {
    const group = this.catalogGroupRepo.create({
      ...createDto,
      creator_id: userId,
      is_official: false,
    });

    return this.catalogGroupRepo.save(group);
  }

  async findAll(page: number = 1, limit: number = 20, categoryId?: number, parentGroupId?: number | null) {
    const query = this.catalogGroupRepo
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.category', 'category')
      .leftJoinAndSelect('group.creator', 'creator')
      .leftJoinAndSelect('group.child_groups', 'child_groups')
      .where('group.is_public = :isPublic', { isPublic: true })
      .andWhere('group.status = :status', { status: 'published' });

    if (categoryId) {
      query.andWhere('group.category_id = :categoryId', { categoryId });
    }

    // parentGroupId가 명시적으로 null이면 최상위만, 숫자면 해당 하위만
    if (parentGroupId === null) {
      query.andWhere('group.parent_group_id IS NULL');
    } else if (parentGroupId !== undefined) {
      query.andWhere('group.parent_group_id = :parentGroupId', { parentGroupId });
    }

    const [groups, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('group.is_official', 'DESC')
      .addOrderBy('group.created_at', 'DESC')
      .getManyAndCount();

    return {
      data: groups,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const group = await this.catalogGroupRepo.findOne({
      where: { id },
      relations: ['category', 'creator', 'parent_group', 'child_groups'],
    });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다');
    }

    await this.catalogGroupRepo.increment({ id }, 'view_count', 1);

    return group;
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
}
