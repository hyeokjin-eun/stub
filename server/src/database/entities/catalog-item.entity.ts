import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { CatalogGroup } from './catalog-group.entity';
import { User } from './user.entity';
// import { CatalogItemMetadata } from './catalog-item-metadata.entity';
import { Like } from './like.entity';
import { CollectionItem } from './collection-item.entity';
import { Stub } from './stub.entity';

@Entity('catalog_items')
export class CatalogItem {
  @PrimaryGeneratedColumn()
  id: number;

  // 기본 정보
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // 분류
  @Column()
  @Index()
  category_id: number;

  @Column({ nullable: true })
  @Index()
  catalog_group_id: number;

  // 소유자
  @Column()
  @Index()
  owner_id: number;

  // 수집 상태 (공통)
  @Column({ type: 'varchar', length: 20, default: 'collected' })
  @Index()
  status: string; // 'collected', 'wish', 'trading'

  // 비주얼
  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail_url: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  // 공개 설정
  @Column({ type: 'boolean', default: true })
  is_public: boolean;

  // 정렬 순서
  @Column({ type: 'integer', default: 0 })
  sort_order: number;

  // 통계
  @Column({ type: 'integer', default: 0 })
  like_count: number;

  @Column({ type: 'integer', default: 0 })
  view_count: number;

  // 타임스탬프
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Category, (category) => category.catalog_items)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => CatalogGroup, (group) => group.catalog_items, {
    nullable: true,
  })
  @JoinColumn({ name: 'catalog_group_id' })
  catalog_group: CatalogGroup;

  @ManyToOne(() => User, (user) => user.catalog_items)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  // @OneToOne(() => CatalogItemMetadata, (metadata) => metadata.item, {
  //   cascade: true,
  //   nullable: true,
  // })
  // metadata: CatalogItemMetadata | null;

  @OneToMany(() => Like, (like) => like.item)
  likes: Like[];

  @OneToMany(() => CollectionItem, (collectionItem) => collectionItem.catalog_item)
  collection_items: CollectionItem[];

  @OneToMany(() => Stub, (stub) => stub.catalog_item)
  stubs: Stub[];
}
