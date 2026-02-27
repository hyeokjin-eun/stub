import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CatalogItem } from './catalog-item.entity';
import { CatalogGroup } from './catalog-group.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // 'MUSIC', 'SPORTS', 'THEATER', etc.

  @Column({ type: 'varchar', length: 100 })
  name: string; // '음악', '스포츠', '연극/뮤지컬'

  @Column({ type: 'varchar', length: 50 })
  icon: string; // 아이콘 식별자

  @Column({ type: 'varchar', length: 50 })
  color: string; // 카테고리 색상

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => CatalogItem, (item) => item.category)
  catalog_items: CatalogItem[];

  @OneToMany(() => CatalogGroup, (group) => group.category)
  catalog_groups: CatalogGroup[];
}
