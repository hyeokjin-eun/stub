import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CatalogItem,
  CatalogItemMetadata,
  Category,
  CatalogGroup,
} from '../database/entities';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';

@Injectable()
export class CatalogItemsService {
  constructor(
    @InjectRepository(CatalogItem)
    private catalogItemRepo: Repository<CatalogItem>,
    @InjectRepository(CatalogItemMetadata)
    private metadataRepo: Repository<CatalogItemMetadata>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(CatalogGroup)
    private catalogGroupRepo: Repository<CatalogGroup>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: number, createDto: CreateCatalogItemDto) {
    const { metadata, ...itemData } = createDto;

    // 아이템 생성
    const item = this.catalogItemRepo.create({
      ...itemData,
      owner_id: userId,
    });

    const savedItem = await this.catalogItemRepo.save(item);

    // 메타데이터 생성
    if (metadata) {
      await this.metadataRepo.save({
        item_id: savedItem.id,
        metadata,
      });
    }

    // 이벤트 발행 (업적 체크)
    this.eventEmitter.emit('ticket.created', { userId });

    return this.findOne(savedItem.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    filters?: {
      category_id?: number;
      catalog_group_id?: number;
      owner_id?: number;
      status?: string;
    },
  ) {
    const query = this.catalogItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.metadata', 'metadata')
      .leftJoinAndSelect('item.owner', 'owner')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.catalog_group', 'catalog_group')
      .where('item.is_public = :isPublic', { isPublic: true });

    if (filters?.category_id) {
      query.andWhere('item.category_id = :categoryId', {
        categoryId: filters.category_id,
      });
    }

    if (filters?.catalog_group_id) {
      query.andWhere('item.catalog_group_id = :groupId', {
        groupId: filters.catalog_group_id,
      });
    }

    if (filters?.owner_id) {
      query.andWhere('item.owner_id = :ownerId', {
        ownerId: filters.owner_id,
      });
    }

    if (filters?.status) {
      query.andWhere('item.status = :status', { status: filters.status });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('item.sort_order', 'ASC')
      .addOrderBy('item.created_at', 'DESC')
      .getManyAndCount();

    return {
      data: items.map((item) => this.sanitizeItem(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const item = await this.catalogItemRepo.findOne({
      where: { id },
      relations: ['metadata', 'owner', 'category', 'catalog_group'],
    });

    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다');
    }

    // 조회수 증가
    await this.catalogItemRepo.increment({ id }, 'view_count', 1);

    return this.sanitizeItem(item);
  }

  async update(
    id: number,
    userId: number,
    updateDto: UpdateCatalogItemDto,
  ) {
    const item = await this.catalogItemRepo.findOne({
      where: { id },
      relations: ['metadata'],
    });

    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다');
    }

    if (item.owner_id !== userId) {
      throw new ForbiddenException('본인의 아이템만 수정할 수 있습니다');
    }

    const { metadata, ...itemData } = updateDto;

    // 아이템 업데이트
    Object.assign(item, itemData);
    await this.catalogItemRepo.save(item);

    // 메타데이터 업데이트
    if (metadata && item.metadata) {
      Object.assign(item.metadata.metadata, metadata);
      await this.metadataRepo.save(item.metadata);
    }

    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const item = await this.catalogItemRepo.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다');
    }

    if (item.owner_id !== userId) {
      throw new ForbiddenException('본인의 아이템만 삭제할 수 있습니다');
    }

    await this.catalogItemRepo.remove(item);
    return { message: '아이템이 삭제되었습니다' };
  }

  private sanitizeItem(item: any) {
    if (item.owner) {
      const { password_hash, oauth_id, ...owner } = item.owner;
      item.owner = owner;
    }
    return item;
  }
}
