import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CatalogItem } from './catalog-item.entity';
import { CatalogGroup } from './catalog-group.entity';
import { CategoryUiConfig } from './category-ui-config.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // 'MOVIE', 'PERFORMANCE', 'SPORTS', 'EXHIBITION' etc.

  @Column({ type: 'varchar', length: 100 })
  name: string; // '영화', '공연', '스포츠', '전시'

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string; // 아이콘 식별자

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string; // 카테고리 색상

  // 계층 구조
  // depth 0 = 대분류, depth 1 = 중분류, depth 2 = 소분류
  @Column({ type: 'integer', default: 0 })
  @Index()
  depth: number;

  @Column({ nullable: true })
  @Index()
  parent_id: number;

  // 수집 타입 (대분류에만 적용)
  // 'TICKET' | 'VIEWING' | 'TRADING_CARD' | 'GOODS'
  @Column({ type: 'varchar', length: 30, nullable: true })
  @Index()
  item_type: string;

  // 정렬 순서
  @Column({ type: 'integer', default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  // Self-referencing relations
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  // UI Config
  @OneToOne(() => CategoryUiConfig, (config) => config.category, {
    nullable: true,
    eager: true, // 카테고리 조회 시 항상 함께 로드
  })
  ui_config: CategoryUiConfig;

  // Relations
  @OneToMany(() => CatalogItem, (item) => item.category)
  catalog_items: CatalogItem[];

  @OneToMany(() => CatalogGroup, (group) => group.category)
  catalog_groups: CatalogGroup[];
}
