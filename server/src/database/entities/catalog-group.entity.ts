import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';
import { CatalogItem } from './catalog-item.entity';

@Entity('catalog_groups')
export class CatalogGroup {
  @PrimaryGeneratedColumn()
  id: number;

  // 기본 정보
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // 분류 - 소분류 category_id 참조
  @Column()
  @Index()
  category_id: number;

  // 생성자
  @Column()
  @Index()
  creator_id: number;

  @Column({ type: 'boolean', default: false })
  @Index()
  is_official: boolean;

  // 디자인
  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail_url: string;

  // 공개 설정
  @Column({ type: 'boolean', default: true })
  is_public: boolean;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status: string; // 'draft', 'published', 'archived'

  // 통계
  @Column({ type: 'integer', default: 0 })
  view_count: number;

  @Column({ type: 'integer', default: 0 })
  ticket_count: number;

  // 타임스탬프
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Category, (category) => category.catalog_groups)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => User, (user) => user.catalog_groups)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => CatalogItem, (item) => item.catalog_group)
  catalog_items: CatalogItem[];
}
