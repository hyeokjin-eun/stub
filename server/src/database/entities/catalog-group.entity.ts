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

  // 분류
  @Column()
  @Index()
  category_id: number;

  // 생성자
  @Column()
  @Index()
  creator_id: number;

  @Column({ type: 'boolean', default: false })
  @Index()
  is_official: boolean; // 관리자 생성 여부

  // 디자인
  @Column({ type: 'varchar', length: 50 })
  color: string;

  @Column({ type: 'varchar', length: 50 })
  icon: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail_url: string; // 그룹 대표 이미지

  // 공개 설정
  @Column({ type: 'boolean', default: true })
  is_public: boolean;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status: string; // 'draft', 'published', 'archived'

  // 통계
  @Column({ type: 'integer', default: 0 })
  view_count: number;

  @Column({ type: 'integer', default: 0 })
  ticket_count: number; // 그룹 내 티켓 수 (캐시)

  // 타임스탬프
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 계층 구조 (parent_group_id가 null이면 최상위 그룹)
  @Column({ nullable: true })
  @Index()
  parent_group_id: number;

  @ManyToOne(() => CatalogGroup, (group) => group.child_groups, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_group_id' })
  parent_group: CatalogGroup;

  @OneToMany(() => CatalogGroup, (group) => group.parent_group)
  child_groups: CatalogGroup[];

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
