import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CatalogItem,
  // CatalogItemMetadata,
  Category,
  CatalogGroup,
} from '../database/entities';
import { CreateCatalogItemDto, ItemType } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';

export interface FindAllItemsOptions {
  page?: number;
  limit?: number;
  categoryId?: number;
  catalogGroupId?: number;
  ownerId?: number;
  itemType?: ItemType;
  status?: string;
}

@Injectable()
export class CatalogItemsService {
  constructor(
    @InjectRepository(CatalogItem)
    private catalogItemRepo: Repository<CatalogItem>,
    // @InjectRepository(CatalogItemMetadata)
    // private metadataRepo: Repository<CatalogItemMetadata>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(CatalogGroup)
    private catalogGroupRepo: Repository<CatalogGroup>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: number, createDto: CreateCatalogItemDto) {
    const { metadata, ...itemData } = createDto;

    // 소분류(depth=2) 검증
    const category = await this.categoryRepo.findOne({
      where: { id: createDto.category_id },
    });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다');
    }
    if (category.depth !== 2) {
      throw new BadRequestException('CatalogItem은 소분류(depth=2) 카테고리에만 연결할 수 있습니다');
    }

    // item_type과 카테고리의 item_type 일치 여부 확인
    // (소분류 자체엔 item_type이 없으니 대분류까지 올라가서 확인)
    const rootCategory = await this.findRootCategory(category);
    if (rootCategory && rootCategory.item_type !== createDto.item_type) {
      throw new BadRequestException(
        `카테고리의 item_type(${rootCategory.item_type})과 요청한 item_type(${createDto.item_type})이 일치하지 않습니다`,
      );
    }

    // VIEWING 타입의 기본 status = 'watched'
    const defaultStatus = createDto.item_type === 'VIEWING' ? 'watched' : 'collected';

    const item = this.catalogItemRepo.create({
      ...itemData,
      owner_id: userId,
      status: itemData.status ?? defaultStatus,
    });

    const savedItem = await this.catalogItemRepo.save(item);

    // TODO: 메타데이터 저장 로직 (필요시 구현)
    // if (metadata) {
    //   await this.metadataRepo.save({
    //     item_id: savedItem.id,
    //     metadata: { ...metadata, type: createDto.item_type },
    //   });
    // }

    // 이벤트 발행 (업적 체크)
    this.eventEmitter.emit('catalog_item.created', {
      userId,
      itemType: createDto.item_type,
    });

    return this.findOne(savedItem.id);
  }

  async findAll(options: FindAllItemsOptions = {}) {
    const { page = 1, limit = 20, categoryId, catalogGroupId, ownerId, itemType, status } = options;

    const query = this.catalogItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.owner', 'owner')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('category.parent', 'midCategory')
      .leftJoinAndSelect('midCategory.parent', 'rootCategory')
      .leftJoinAndSelect('item.catalog_group', 'catalog_group')
      .where('item.is_public = :isPublic', { isPublic: true });

    if (categoryId) {
      query.andWhere('item.category_id = :categoryId', { categoryId });
    }

    if (catalogGroupId) {
      query.andWhere('item.catalog_group_id = :catalogGroupId', { catalogGroupId });
    }

    if (ownerId) {
      query.andWhere('item.owner_id = :ownerId', { ownerId });
    }

    if (itemType) {
      query.andWhere('item.item_type = :itemType', { itemType });
    }

    if (status) {
      query.andWhere('item.status = :status', { status });
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
      relations: ['owner', 'category', 'category.parent', 'category.parent.parent', 'catalog_group'],
    });

    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다');
    }

    await this.catalogItemRepo.increment({ id }, 'view_count', 1);

    return this.sanitizeItem(item);
  }

  async update(id: number, userId: number, updateDto: UpdateCatalogItemDto) {
    const item = await this.catalogItemRepo.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다');
    }
    if (item.owner_id !== userId) {
      throw new ForbiddenException('본인의 아이템만 수정할 수 있습니다');
    }

    const { metadata, ...itemData } = updateDto;

    Object.assign(item, itemData);
    await this.catalogItemRepo.save(item);

    // TODO: 메타데이터 업데이트 로직 (필요시 구현)
    // if (metadata) {
    //   await this.metadataRepo.save({
    //     item_id: item.id,
    //     metadata,
    //   });
    // }

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

  // ── Admin: owner 체크 없이 수정/삭제 ─────────────────────────────

  async adminUpdate(id: number, updateDto: UpdateCatalogItemDto) {
    const item = await this.catalogItemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('아이템을 찾을 수 없습니다');
    const { metadata, ...itemData } = updateDto;
    Object.assign(item, itemData);
    await this.catalogItemRepo.save(item);
    return this.findOne(id);
  }

  async adminRemove(id: number) {
    const item = await this.catalogItemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('아이템을 찾을 수 없습니다');

    // catalog_group의 ticket_count 동기화
    if (item.catalog_group_id) {
      await this.catalogGroupRepo.decrement({ id: item.catalog_group_id }, 'ticket_count', 1);
    }

    await this.catalogItemRepo.remove(item);
    return { message: '아이템이 삭제되었습니다' };
  }

  // ----------------------------------------------------------------
  // private
  // ----------------------------------------------------------------

  private async findRootCategory(category: Category): Promise<Category | null> {
    if (category.depth === 0) return category;

    let current = category;
    while (current.parent_id) {
      const parent = await this.categoryRepo.findOne({
        where: { id: current.parent_id },
      });
      if (!parent) break;
      if (parent.depth === 0) return parent;
      current = parent;
    }
    return null;
  }

  private sanitizeItem(item: any) {
    if (item.owner) {
      const { password_hash, oauth_id, ...owner } = item.owner;
      item.owner = owner;
    }
    return item;
  }
}
