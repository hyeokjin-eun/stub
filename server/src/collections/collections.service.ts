import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from '../database/entities/collection.entity';
import { CollectionItem } from '../database/entities/collection-item.entity';
import { CollectionLike } from '../database/entities/collection-like.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionItem)
    private collectionItemRepo: Repository<CollectionItem>,
    @InjectRepository(CollectionLike)
    private collectionLikeRepo: Repository<CollectionLike>,
  ) {}

  // 내 컬렉션 목록
  async findByUser(userId: number) {
    const collections = await this.collectionRepo.find({
      where: { user_id: userId },
      relations: ['collection_items', 'collection_items.catalog_item', 'collection_items.catalog_item.category', 'collection_items.stub'],
      order: { created_at: 'DESC' },
    });

    // 각 컬렉션의 좋아요 수 조회
    const collectionsWithLikes = await Promise.all(
      collections.map(async (col) => {
        const likeCount = await this.collectionLikeRepo.count({
          where: { collection_id: col.id },
        });
        return {
          ...col,
          total_count: col.collection_items.length,
          collected_count: col.collection_items.filter((ci) => ci.stub_id != null).length,
          like_count: likeCount,
        };
      }),
    );

    return collectionsWithLikes;
  }

  // 공개 컬렉션 목록 (다른 사람들의 공개 컬렉션)
  async findPublic(userId: number) {
    const collections = await this.collectionRepo.find({
      where: { is_public: true },
      relations: ['collection_items', 'collection_items.catalog_item', 'collection_items.catalog_item.category', 'collection_items.stub'],
      order: { created_at: 'DESC' },
    });

    // 내 컬렉션은 제외
    const filtered = collections.filter((col) => col.user_id !== userId);

    // 각 컬렉션의 좋아요 수 조회
    const collectionsWithLikes = await Promise.all(
      filtered.map(async (col) => {
        const likeCount = await this.collectionLikeRepo.count({
          where: { collection_id: col.id },
        });
        return {
          ...col,
          total_count: col.collection_items.length,
          collected_count: col.collection_items.filter((ci) => ci.stub_id != null).length,
          like_count: likeCount,
        };
      }),
    );

    return collectionsWithLikes;
  }

  // 컬렉션 단건 조회
  async findOne(id: number, userId: number) {
    const collection = await this.collectionRepo.findOne({
      where: { id },
      relations: [
        'collection_items',
        'collection_items.catalog_item',
        'collection_items.catalog_item.category',
        'collection_items.catalog_item.catalog_group',
        'collection_items.stub',
      ],
      order: { collection_items: { order_index: 'ASC' } },
    });

    if (!collection) throw new NotFoundException('컬렉션을 찾을 수 없습니다');
    if (collection.user_id !== userId && !collection.is_public) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    return {
      ...collection,
      total_count: collection.collection_items.length,
      collected_count: collection.collection_items.filter((ci) => ci.stub_id != null).length,
    };
  }

  // 컬렉션 생성
  async create(userId: number, dto: { name: string; description?: string; is_public?: boolean }) {
    const collection = this.collectionRepo.create({
      user_id: userId,
      name: dto.name,
      description: dto.description,
      is_public: dto.is_public ?? true,
    });
    return this.collectionRepo.save(collection);
  }

  // 컬렉션 수정
  async update(id: number, userId: number, dto: { name?: string; description?: string; is_public?: boolean }) {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) throw new NotFoundException('컬렉션을 찾을 수 없습니다');
    if (collection.user_id !== userId) throw new ForbiddenException('권한이 없습니다');

    Object.assign(collection, dto);
    return this.collectionRepo.save(collection);
  }

  // 컬렉션 삭제
  async remove(id: number, userId: number) {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) throw new NotFoundException('컬렉션을 찾을 수 없습니다');
    if (collection.user_id !== userId) throw new ForbiddenException('권한이 없습니다');
    await this.collectionRepo.remove(collection);
    return { deleted: true };
  }

  // 컬렉션에 카탈로그 아이템 추가
  async addItem(collectionId: number, userId: number, catalogItemId: number, stubId?: number) {
    const collection = await this.collectionRepo.findOne({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('컬렉션을 찾을 수 없습니다');
    if (collection.user_id !== userId) throw new ForbiddenException('권한이 없습니다');

    const existing = await this.collectionItemRepo.findOne({
      where: { collection_id: collectionId, catalog_item_id: catalogItemId },
    });
    if (existing) return existing;

    const item = this.collectionItemRepo.create({
      collection_id: collectionId,
      catalog_item_id: catalogItemId,
      stub_id: stubId ?? null,
    });
    return this.collectionItemRepo.save(item);
  }

  // 컬렉션에서 아이템 제거
  async removeItem(collectionId: number, userId: number, catalogItemId: number) {
    const collection = await this.collectionRepo.findOne({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('컬렉션을 찾을 수 없습니다');
    if (collection.user_id !== userId) throw new ForbiddenException('권한이 없습니다');

    const item = await this.collectionItemRepo.findOne({
      where: { collection_id: collectionId, catalog_item_id: catalogItemId },
    });
    if (!item) throw new NotFoundException('아이템을 찾을 수 없습니다');
    await this.collectionItemRepo.remove(item);
    return { deleted: true };
  }

  // 컬렉션 아이템에 stub 연결 (수집 완료 표시)
  async linkStub(collectionId: number, userId: number, catalogItemId: number, stubId: number) {
    const collection = await this.collectionRepo.findOne({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('컬렉션을 찾을 수 없습니다');
    if (collection.user_id !== userId) throw new ForbiddenException('권한이 없습니다');

    const item = await this.collectionItemRepo.findOne({
      where: { collection_id: collectionId, catalog_item_id: catalogItemId },
    });
    if (!item) throw new NotFoundException('아이템을 찾을 수 없습니다');

    item.stub_id = stubId;
    return this.collectionItemRepo.save(item);
  }
}
