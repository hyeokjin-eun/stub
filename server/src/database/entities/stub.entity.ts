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
import { User } from './user.entity';
import { CatalogItem } from './catalog-item.entity';
import { CollectionItem } from './collection-item.entity';

@Entity('stubs')
export class Stub {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @Column({ nullable: true })
  @Index()
  catalog_item_id: number; // 공식 카탈로그 연결 (nullable - 비공식 티켓도 등록 가능)

  // 실물 정보
  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string; // 실물 사진

  @Column({ type: 'varchar', length: 20, default: 'collected' })
  @Index()
  status: string; // 'collected' | 'wish' | 'trading'

  @Column({ type: 'varchar', length: 20, nullable: true })
  condition: string; // 'mint' | 'good' | 'worn'

  @Column({ type: 'text', nullable: true })
  notes: string; // 메모

  @Column({ type: 'datetime', nullable: true })
  acquired_at: Date; // 취득일

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.stubs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CatalogItem, (item) => item.stubs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'catalog_item_id' })
  catalog_item: CatalogItem;

  @OneToMany(() => CollectionItem, (collectionItem) => collectionItem.stub)
  collection_items: CollectionItem[];
}
