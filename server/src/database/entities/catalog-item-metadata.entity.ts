import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CatalogItem } from './catalog-item.entity';

@Entity('catalog_item_metadata')
export class CatalogItemMetadata {
  @PrimaryColumn()
  item_id: number;

  @Column({ type: 'simple-json' })
  metadata: {
    type: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => CatalogItem, (item) => item.metadata, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'item_id' })
  item: CatalogItem;
}
