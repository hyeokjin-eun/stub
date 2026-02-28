import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category, CategoryUiConfig, ItemTypeUiConfig } from '../database/entities';

export type ItemType = 'TICKET' | 'VIEWING' | 'TRADING_CARD' | 'GOODS';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(CategoryUiConfig)
    private uiConfigRepo: Repository<CategoryUiConfig>,
    @InjectRepository(ItemTypeUiConfig)
    private itemTypeConfigRepo: Repository<ItemTypeUiConfig>,
  ) {}

  /**
   * item_type별 전체 카테고리 트리 반환
   * depth=0(대분류) → children(중분류) → children(소분류) 중첩 구조
   */
  async findTree(itemType?: ItemType): Promise<Category[]> {
    const where: any = { depth: 0 };
    if (itemType) where.item_type = itemType;

    const roots = await this.categoryRepo.find({
      where,
      relations: ['ui_config'],
      order: { sort_order: 'ASC', id: 'ASC' },
    });

    // 각 대분류에 중분류 → 소분류 재귀 로드
    for (const root of roots) {
      root.children = await this.loadChildren(root.id);
    }

    return roots;
  }

  /**
   * 특정 깊이의 카테고리 목록 반환 (flat)
   */
  async findByDepth(depth: number, parentId?: number, itemType?: ItemType): Promise<Category[]> {
    const where: any = { depth };
    if (parentId !== undefined) where.parent_id = parentId;
    if (itemType) where.item_type = itemType;

    return this.categoryRepo.find({
      where,
      order: { sort_order: 'ASC', id: 'ASC' },
    });
  }

  /**
   * item_type 별 대분류 목록 (depth=0)
   */
  async findRoots(itemType?: ItemType): Promise<Category[]> {
    return this.findByDepth(0, undefined, itemType);
  }

  /**
   * 특정 카테고리의 자식 목록 (중분류 or 소분류)
   */
  async findChildren(parentId: number): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { parent_id: parentId },
      order: { sort_order: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다');
    }
    return category;
  }

  async findByCode(code: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { code },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다');
    }
    return category;
  }

  /**
   * 소분류(depth=2) id를 받아 대분류까지 경로 반환
   * [대분류, 중분류, 소분류] 순서
   */
  async findBreadcrumb(id: number): Promise<Category[]> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다');
    }

    const breadcrumb: Category[] = [category];

    let current = category;
    while (current.parent_id) {
      const parent = await this.categoryRepo.findOne({
        where: { id: current.parent_id },
        relations: ['parent'],
      });
      if (!parent) break;
      breadcrumb.unshift(parent);
      current = parent;
    }

    return breadcrumb;
  }

  // ----------------------------------------------------------------
  // CategoryUiConfig CRUD
  // ----------------------------------------------------------------

  /**
   * 모든 카테고리의 UI 설정 조회 (어드민용)
   */
  async findAllUiConfigs(): Promise<CategoryUiConfig[]> {
    return this.uiConfigRepo.find({
      relations: ['category'],
      order: { category_id: 'ASC' },
    });
  }

  /**
   * 특정 카테고리의 UI 설정 조회
   */
  async findUiConfig(categoryId: number): Promise<CategoryUiConfig | null> {
    return this.uiConfigRepo.findOne({
      where: { category_id: categoryId },
      relations: ['category'],
    });
  }

  /**
   * UI 설정 생성 또는 업데이트 (Upsert)
   */
  async upsertUiConfig(
    categoryId: number,
    data: Partial<Omit<CategoryUiConfig, 'id' | 'category_id' | 'created_at' | 'updated_at'>>,
  ): Promise<CategoryUiConfig> {
    // 카테고리 존재 확인
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['parent'],
    });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다');
    }

    // is_default=true로 설정하는 경우, 같은 item_type과 depth의 다른 카테고리들을 is_default=false로 변경
    if (data.is_default === true) {
      // 같은 depth와 item_type을 가진 모든 카테고리 찾기
      const siblings = await this.categoryRepo.find({
        where: {
          depth: category.depth,
          item_type: category.item_type,
        },
        relations: ['ui_config'],
      });

      // 같은 부모를 가진 형제들만 필터링 (같은 계층)
      const sameLevelSiblings = siblings.filter((s) => s.parent_id === category.parent_id && s.id !== categoryId);

      // 모든 형제들의 is_default를 false로 설정
      for (const sibling of sameLevelSiblings) {
        if (sibling.ui_config?.is_default === true) {
          const siblingConfig = await this.uiConfigRepo.findOne({
            where: { category_id: sibling.id },
          });
          if (siblingConfig) {
            siblingConfig.is_default = false;
            await this.uiConfigRepo.save(siblingConfig);
          }
        }
      }
    }

    let config = await this.uiConfigRepo.findOne({ where: { category_id: categoryId } });

    if (config) {
      // 업데이트
      Object.assign(config, data);
      return this.uiConfigRepo.save(config);
    } else {
      // 생성
      config = this.uiConfigRepo.create({
        category_id: categoryId,
        ...data,
      });
      return this.uiConfigRepo.save(config);
    }
  }

  /**
   * UI 설정 삭제 (기본값으로 돌아감)
   */
  async deleteUiConfig(categoryId: number): Promise<void> {
    const config = await this.uiConfigRepo.findOne({ where: { category_id: categoryId } });
    if (config) {
      await this.uiConfigRepo.remove(config);
    }
  }

  // ----------------------------------------------------------------
  // ItemTypeUiConfig CRUD
  // ----------------------------------------------------------------

  /**
   * 모든 ItemType 설정 조회 (sort_order 순서)
   */
  async findAllItemTypeConfigs(): Promise<ItemTypeUiConfig[]> {
    return this.itemTypeConfigRepo.find({
      order: { sort_order: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 특정 ItemType 설정 조회
   */
  async findItemTypeConfig(itemType: string): Promise<ItemTypeUiConfig | null> {
    return this.itemTypeConfigRepo.findOne({
      where: { item_type: itemType },
    });
  }

  /**
   * ItemType 설정 업데이트 (Upsert)
   */
  async upsertItemTypeConfig(
    itemType: string,
    data: Partial<Omit<ItemTypeUiConfig, 'id' | 'item_type' | 'created_at' | 'updated_at'>>,
  ): Promise<ItemTypeUiConfig> {
    // is_default=true로 설정하는 경우, 다른 모든 ItemType의 is_default를 false로 변경
    if (data.is_default === true) {
      const allConfigs = await this.itemTypeConfigRepo.find();
      for (const otherConfig of allConfigs) {
        if (otherConfig.item_type !== itemType && otherConfig.is_default === true) {
          otherConfig.is_default = false;
          await this.itemTypeConfigRepo.save(otherConfig);
        }
      }
    }

    let config = await this.itemTypeConfigRepo.findOne({ where: { item_type: itemType } });

    if (config) {
      // 업데이트
      Object.assign(config, data);
      return this.itemTypeConfigRepo.save(config);
    } else {
      // 생성
      config = this.itemTypeConfigRepo.create({
        item_type: itemType,
        ...data,
      });
      return this.itemTypeConfigRepo.save(config);
    }
  }

  /**
   * ItemType 설정 삭제 (기본값으로 복원)
   */
  async deleteItemTypeConfig(itemType: string): Promise<void> {
    const config = await this.itemTypeConfigRepo.findOne({ where: { item_type: itemType } });
    if (config) {
      await this.itemTypeConfigRepo.remove(config);
    }
  }

  // ----------------------------------------------------------------
  // private
  // ----------------------------------------------------------------

  private async loadChildren(parentId: number): Promise<Category[]> {
    const children = await this.categoryRepo.find({
      where: { parent_id: parentId },
      relations: ['ui_config'],
      order: { sort_order: 'ASC', id: 'ASC' },
    });

    for (const child of children) {
      const grandChildren = await this.categoryRepo.find({
        where: { parent_id: child.id },
        relations: ['ui_config'],
        order: { sort_order: 'ASC', id: 'ASC' },
      });
      child.children = grandChildren;
    }

    return children;
  }
}
