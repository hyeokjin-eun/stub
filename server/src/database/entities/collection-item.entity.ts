import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Collection } from './collection.entity';
import { CatalogItem } from './catalog-item.entity';
import { Stub } from './stub.entity';

@Entity('collection_items')
@Unique(['collection_id', 'catalog_item_id'])
export class CollectionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  collection_id: number;

  @Column()
  @Index()
  catalog_item_id: number; // 목표 카탈로그 아이템

  @Column({ nullable: true })
  @Index()
  stub_id: number; // 수집 완료 시 연결되는 실물 스텁 (null = 미수집)

  @Column({ type: 'integer', default: 0 })
  order_index: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Collection, (collection) => collection.collection_items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @ManyToOne(() => CatalogItem, (item) => item.collection_items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'catalog_item_id' })
  catalog_item: CatalogItem;

  @ManyToOne(() => Stub, (stub) => stub.collection_items, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'stub_id' })
  stub: Stub;
}
