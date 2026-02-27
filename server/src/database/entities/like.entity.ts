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
import { User } from './user.entity';
import { CatalogItem } from './catalog-item.entity';

@Entity('likes')
@Unique(['user_id', 'item_id'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @Column()
  @Index()
  item_id: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CatalogItem, (item) => item.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: CatalogItem;
}
